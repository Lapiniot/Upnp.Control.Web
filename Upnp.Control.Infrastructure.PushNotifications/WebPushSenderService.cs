using System.Net;
using System.Text.Json;
using System.Threading.Channels;
using Upnp.Control.Abstractions;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.Infrastructure.PushNotifications;

#pragma warning disable CA1031 // by design
internal sealed partial class WebPushSenderService : BackgroundServiceBase, IObserver<UpnpDiscoveryEvent>, IObserver<AVTPropChangedEvent>
{
    private readonly Channel<(NotificationType Type, byte[] Payload)> channel;
    private readonly IOptions<JsonOptions> jsonOptions;
    private readonly ILogger<WebPushSenderService> logger;
    private readonly IServiceProvider services;
    private readonly IOptions<WebPushOptions> wpOptions;

    public WebPushSenderService(IServiceProvider services,
        IOptions<JsonOptions> jsonOptions, IOptions<WebPushOptions> wpOptions,
        ILogger<WebPushSenderService> logger) : base(logger)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(logger);
        ArgumentNullException.ThrowIfNull(jsonOptions);
        ArgumentNullException.ThrowIfNull(wpOptions);

        this.services = services;
        this.logger = logger;
        this.jsonOptions = jsonOptions;
        this.wpOptions = wpOptions;

        var options = wpOptions.Value;

        channel = Channel.CreateBounded<(NotificationType, byte[])>(new BoundedChannelOptions(options.QueueCapacity)
        {
            FullMode = options.QueueFullMode,
            SingleReader = true,
            SingleWriter = false
        });
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            var reader = channel.Reader;
            var ttlSeconds = wpOptions.Value.TTLSeconds;
            var timeoutMilliseconds = wpOptions.Value.TimeoutMiliseconds;

            while (await reader.WaitToReadAsync(stoppingToken).ConfigureAwait(false))
            {
                using var scope = services.CreateScope();
                var serviceProvider = scope.ServiceProvider;
                var client = serviceProvider.GetRequiredService<IWebPushClient>();

                while (reader.TryRead(out var message))
                {
                    if (stoppingToken.IsCancellationRequested) return;

                    var enumerateHandler = serviceProvider.GetRequiredService<IAsyncEnumerableQueryHandler<PSEnumerateQuery, PushNotificationSubscription>>();

                    await foreach (var (endpoint, type, _, p256dhKey, authKey) in enumerateHandler.ExecuteAsync(new(message.Type), stoppingToken).ConfigureAwait(false))
                    {
                        try
                        {
                            using var timeoutCts = new CancellationTokenSource(timeoutMilliseconds);
                            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken, timeoutCts.Token);
                            await client.SendAsync(endpoint, p256dhKey, authKey, message.Payload, ttlSeconds, linkedCts.Token).ConfigureAwait(false);
                        }
                        catch (HttpRequestException hre) when (hre.StatusCode is HttpStatusCode.Gone or HttpStatusCode.Forbidden)
                        {
                            var removeHandler = serviceProvider.GetRequiredService<IAsyncCommandHandler<PSRemoveCommand>>();
                            await removeHandler.ExecuteAsync(new(type, endpoint), stoppingToken).ConfigureAwait(false);
                        }
                        catch (Exception ex)
                        {
                            LogPushError(ex, endpoint);
                        }
                    }
                }
            }
        }
        catch (OperationCanceledException) { /* expected */ }
    }

    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    private async void Post<[DynamicallyAccessedMembers(All)] T>(NotificationType type, T message) where T : NotificationMessage
    {
        try
        {
            var payload = JsonSerializer.SerializeToUtf8Bytes(message, jsonOptions.Value.SerializerOptions);
            await channel.Writer.WriteAsync((type, payload)).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            LogMessageQueueingError(ex);
        }
    }

    [LoggerMessage(11, LogLevel.Error, "Error pushing message to endpoint: {endpoint}")]
    private partial void LogPushError(Exception ex, Uri endpoint);

    [LoggerMessage(12, LogLevel.Error, "Error pushing message")]
    private partial void LogError(Exception ex);

    [LoggerMessage(13, LogLevel.Error, "Error writing message to the queue")]
    private partial void LogMessageQueueingError(Exception ex);

    #region Implementation of IObserver<UpnpAVTransportPropertyChangedEvent>

    void IObserver<AVTPropChangedEvent>.OnNext(AVTPropChangedEvent value)
    {
        if (value is null || !value.Properties.TryGetValue("TransportState", out var state) || state != "PLAYING")
        {
            return;
        }

        Post(NotificationType.PlaybackStateChange,
            new AVStateMessage(value.Device,
                Factories.CreateAVState(value.Properties),
                Factories.CreateAVPosition(value.Properties),
                value.VendorProperties));
    }

    public void OnCompleted() { }

    public void OnError(Exception error) { }

    #endregion

    #region Implementation of IObserver<UpnpDiscoveryEvent>

    void IObserver<UpnpDiscoveryEvent>.OnNext(UpnpDiscoveryEvent value)
    {
        switch (value)
        {
            case UpnpDeviceAppearedEvent dae:
                Post(NotificationType.DeviceDiscovery, new UpnpDiscoveryMessage("appeared", dae.Device));
                break;
            case UpnpDeviceDisappearedEvent dde:
                Post(NotificationType.DeviceDiscovery, new UpnpDiscoveryMessage("disappeared", dde.Device));
                break;
        }
    }

    #endregion
}