using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Text.Json;
using System.Threading.Channels;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Upnp.Control.Infrastructure.PushNotifications.Configuration;
using Upnp.Control.Models;
using Upnp.Control.Models.Events;
using Upnp.Control.Models.PushNotifications;
using Upnp.Control.Services.PushNotifications;

namespace Upnp.Control.Infrastructure.PushNotifications
{
    public sealed partial class WebPushSenderService : BackgroundService, IObserver<UpnpDiscoveryEvent>, IObserver<UpnpEvent>
    {
        private readonly IServiceProvider services;
        private readonly ILogger<WebPushSenderService> logger;
        private readonly IOptions<JsonOptions> jsonOptions;
        private readonly IOptions<WebPushOptions> wpOptions;
        private readonly Channel<(NotificationType Type, byte[] Payload)> channel;

        public WebPushSenderService(IServiceProvider services,
            IOptions<JsonOptions> jsonOptions, IOptions<WebPushOptions> wpOptions,
            ILogger<WebPushSenderService> logger)
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
            switch(value)
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
            if(value is UpnpAVTransportPropertyChangedEvent @event)
            {
                var bag = @event.Properties;

                if(bag.Count == 1 && (bag.ContainsKey("RelativeTimePosition") || bag.ContainsKey("AbsoluteTimePosition")))
                {
                    // Workaround for some quirky renderers that report position changes every second during playback
                    // via state variable changes. Some way of throttling is definitely needed here :(
                    return;
                }

                if(!bag.TryGetValue("TransportState", out var state) || state != "PLAYING")
                {
                    // We currently send pushes for "PLAYING" state
                    return;
                }

                Post(NotificationType.PlaybackStateChange,
                    new AVStateMessage(
                        Factories.CreateAVState(bag),
                        Factories.CreateAVPosition(bag),
                        @event.VendorProperties));
            }
        }

        #endregion

        [SuppressMessage("Design", "CA1031: Do not catch general exception types", Justification = "By design")]
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while(!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var message = await channel.Reader.ReadAsync(stoppingToken).ConfigureAwait(false);

                    using var scope = services.CreateScope();
                    var repository = scope.ServiceProvider.GetRequiredService<IPushSubscriptionRepository>();
                    var client = scope.ServiceProvider.GetRequiredService<IWebPushClient>();

                    await foreach(var subscription in repository.EnumerateAsync(message.Type, stoppingToken).ConfigureAwait(false))
                    {
                        Uri endpoint = subscription.Endpoint;
                        try
                        {
                            await client.SendAsync(endpoint, subscription.P256dhKey, subscription.AuthKey, message.Payload, wpOptions.Value.TTLSeconds, stoppingToken).ConfigureAwait(false);
                        }
                        catch(OperationCanceledException)
                        {
                            // expected
                        }
                        catch(HttpRequestException hre) when(hre.StatusCode is HttpStatusCode.Gone or HttpStatusCode.Forbidden)
                        {
                            await repository.RemoveAsync(subscription, stoppingToken).ConfigureAwait(false);
                        }
                        catch(Exception ex)
                        {
                            LogPushError(ex, endpoint);
                        }
                    }
                }
                catch(OperationCanceledException oce) when(oce.CancellationToken == stoppingToken)
                {
                    // expected
                    break;
                }
                catch(ChannelClosedException)
                {
                    LogChannelClosed();
                    break;
                }
                catch(Exception ex)
                {
                    LogError(ex);
                }
            }
        }

        [SuppressMessage("Design", "CA1031: Do not catch general exception types", Justification = "By design")]
        private async void Post<T>(NotificationType type, T message) where T : NotificationMessage
        {
            try
            {
                var vt = channel.Writer.WriteAsync((type, JsonSerializer.SerializeToUtf8Bytes(message, jsonOptions.Value.SerializerOptions)));
                if(!vt.IsCompletedSuccessfully) await vt.ConfigureAwait(false);
            }
            catch(Exception ex)
            {
                LogMessageQueueingError(ex);
            }
        }

        public override void Dispose()
        {
            channel.Writer.TryComplete();
            base.Dispose();
        }

        [LoggerMessage(1, LogLevel.Error, "Error pushing message to endpoint: {endpoint}")]
        private partial void LogPushError(Exception ex, Uri endpoint);

        [LoggerMessage(2, LogLevel.Error, "Error pushing message")]
        private partial void LogError(Exception ex);

        [LoggerMessage(3, LogLevel.Error, "Error writing message to the queue")]
        private partial void LogMessageQueueingError(Exception ex);

        [LoggerMessage(4, LogLevel.Warning, "Channel closed. Terminating push dispatch loop")]
        private partial void LogChannelClosed();
    }
}