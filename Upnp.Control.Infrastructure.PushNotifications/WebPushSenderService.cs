using System.Net;
using System.Text.Json;
using System.Threading.Channels;
using Upnp.Control.Abstractions;
using Upnp.Control.Models;
using Upnp.Control.Models.Events;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.Infrastructure.PushNotifications;

#pragma warning disable CA1031 // by design
#pragma warning disable CA1812 // instantiated by DI container
internal sealed partial class WebPushSenderService : BackgroundServiceBase, IObserver<UpnpDiscoveryEvent>, IObserver<UpnpEvent>
{
    private readonly IServiceProvider services;
    private readonly ILogger<WebPushSenderService> logger;
    private readonly IOptions<JsonOptions> jsonOptions;
    private readonly IOptions<WebPushOptions> wpOptions;
    private readonly Channel<(NotificationType Type, byte[] Payload)> channel;

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

        channel = Channel.CreateBounded<(NotificationType, byte[])>(new BoundedChannelOptions(100)
        {
            FullMode = BoundedChannelFullMode.DropOldest,
            SingleReader = true,
            SingleWriter = false
        });
    }

    #region Implementation of IObserver<UpnpDiscoveryEvent>

    public void OnCompleted()
    {
    }

    public void OnError(Exception error)
    {
    }

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

    #region Implementation of IObserver<UpnpAVTransportPropertyChangedEvent>

    void IObserver<UpnpEvent>.OnNext(UpnpEvent value)
    {
        if (value is not AVTPropChangedEvent @event || !@event.Properties.TryGetValue("TransportState", out var state) || state != "PLAYING")
        {
            return;
        }

        Post(NotificationType.PlaybackStateChange,
            new AVStateMessage(value.Device,
                Factories.CreateAVState(@event.Properties),
                Factories.CreateAVPosition(@event.Properties),
                @event.VendorProperties));
    }

    #endregion

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var message = await channel.Reader.ReadAsync(stoppingToken).ConfigureAwait(false);

                using var scope = services.CreateScope();
                var client = scope.ServiceProvider.GetRequiredService<IWebPushClient>();
                var enumerateHandler = scope.ServiceProvider.GetRequiredService<IAsyncEnumerableQueryHandler<PSEnumerateQuery, PushNotificationSubscription>>();

                await foreach (var (endpoint, type, _, p256dhKey, authKey) in enumerateHandler.ExecuteAsync(new PSEnumerateQuery(message.Type), stoppingToken).ConfigureAwait(false))
                {
                    try
                    {
                        await client.SendAsync(endpoint, p256dhKey, authKey, message.Payload, wpOptions.Value.TTLSeconds, stoppingToken).ConfigureAwait(false);
                    }
                    catch (OperationCanceledException)
                    {
                        // expected
                    }
                    catch (HttpRequestException hre) when (hre.StatusCode == HttpStatusCode.Gone || hre.StatusCode == HttpStatusCode.Forbidden)
                    {
                        var commandHandler = scope.ServiceProvider.GetRequiredService<IAsyncCommandHandler<PSRemoveCommand>>();
                        await commandHandler.ExecuteAsync(new PSRemoveCommand(type, endpoint), stoppingToken).ConfigureAwait(false);
                    }
                    catch (Exception ex)
                    {
                        LogPushError(ex, endpoint);
                    }
                }
            }
            catch (OperationCanceledException oce) when (oce.CancellationToken == stoppingToken)
            {
                // expected
                break;
            }
            catch (ChannelClosedException)
            {
                LogChannelClosed();
                break;
            }
            catch (Exception ex)
            {
                LogError(ex);
            }
        }
    }

    private async void Post<T>(NotificationType type, T message) where T : NotificationMessage
    {
        try
        {
            var vt = channel.Writer.WriteAsync((type, JsonSerializer.SerializeToUtf8Bytes(message, jsonOptions.Value.SerializerOptions)));
            if (!vt.IsCompletedSuccessfully) await vt.ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            LogMessageQueueingError(ex);
        }
    }

    public override void Dispose()
    {
        channel.Writer.TryComplete();
        base.Dispose();
    }

    [LoggerMessage(11, LogLevel.Error, "Error pushing message to endpoint: {endpoint}")]
    private partial void LogPushError(Exception ex, Uri endpoint);

    [LoggerMessage(12, LogLevel.Error, "Error pushing message")]
    private partial void LogError(Exception ex);

    [LoggerMessage(13, LogLevel.Error, "Error writing message to the queue")]
    private partial void LogMessageQueueingError(Exception ex);

    [LoggerMessage(14, LogLevel.Warning, "Channel closed. Terminating push dispatch loop")]
    private partial void LogChannelClosed();
}