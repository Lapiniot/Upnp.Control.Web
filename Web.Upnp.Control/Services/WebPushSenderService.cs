using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Channels;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Infrastructure.HttpClients;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Models.Events;

namespace Web.Upnp.Control.Services
{
    public record PushMessage(NotificationType Type, byte[] Payload);

    public sealed partial class WebPushSenderService : BackgroundService, IObserver<UpnpDiscoveryEvent>
    {
        private readonly IServiceProvider services;
        private readonly ILogger<WebPushSenderService> logger;
        private readonly IOptions<JsonOptions> jsonOptions;
        private readonly IOptions<WebPushOptions> wpOptions;
        private readonly Channel<PushMessage> channel;

        public WebPushSenderService(IServiceProvider services, ILogger<WebPushSenderService> logger,
            IOptions<JsonOptions> jsonOptions, IOptions<WebPushOptions> wpOptions)
        {
            ArgumentNullException.ThrowIfNull(services);
            ArgumentNullException.ThrowIfNull(logger);
            ArgumentNullException.ThrowIfNull(jsonOptions);
            ArgumentNullException.ThrowIfNull(wpOptions);

            this.services = services;
            this.logger = logger;
            this.jsonOptions = jsonOptions;
            this.wpOptions = wpOptions;

            channel = Channel.CreateBounded<PushMessage>(new BoundedChannelOptions(100)
            {
                FullMode = BoundedChannelFullMode.DropOldest,
                SingleReader = true,
                SingleWriter = false
            });
        }

        #region Implementation of IObserver<UpnpDiscoveryEvent>

        void IObserver<UpnpDiscoveryEvent>.OnCompleted()
        {
        }

        void IObserver<UpnpDiscoveryEvent>.OnError(Exception error)
        {
        }

        void IObserver<UpnpDiscoveryEvent>.OnNext(UpnpDiscoveryEvent value)
        {
            switch (value)
            {
                case UpnpDeviceAppearedEvent dae: Post(new PushMessage(NotificationType.DeviceDiscovery, JsonSerializer.SerializeToUtf8Bytes(new UpnpDiscoveryMessage("appeared", dae.Device), jsonOptions.Value.SerializerOptions))); break;
                case UpnpDeviceDisappearedEvent dde: Post(new PushMessage(NotificationType.DeviceDiscovery, JsonSerializer.SerializeToUtf8Bytes(new UpnpDiscoveryMessage("disappeared", dde.Device), jsonOptions.Value.SerializerOptions))); break;
            }
        }

        #endregion

        [SuppressMessage("Design", "CA1031: Do not catch general exception types", Justification = "By design")]
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var message = await channel.Reader.ReadAsync(stoppingToken).ConfigureAwait(false);
                    var payload = JsonSerializer.SerializeToUtf8Bytes(message, jsonOptions.Value.SerializerOptions);

                    using var scope = services.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<PushSubscriptionDbContext>();
                    var client = scope.ServiceProvider.GetRequiredService<IWebPushClient>();

                    try
                    {
                        var subscriptions = context.Subscriptions.Where(s => s.Type == message.Type).AsAsyncEnumerable();
                        await foreach (var subscription in subscriptions.WithCancellation(stoppingToken).ConfigureAwait(false))
                        {
                            var endpoint = subscription.Endpoint;
                            var keys = new SubscriptionKeys(subscription.P256dhKey, subscription.AuthKey);
                            try
                            {
                                await client.SendAsync(endpoint, keys, payload, wpOptions.Value.TTLSeconds, stoppingToken).ConfigureAwait(false);
                            }
                            catch (OperationCanceledException)
                            {
                                // expected
                            }
                            catch (HttpRequestException hre) when (hre.StatusCode is HttpStatusCode.Gone or HttpStatusCode.Forbidden)
                            {
                                context.Remove(subscription);
                            }
                            catch (Exception ex)
                            {
                                LogPushError(ex, endpoint);
                            }
                        }
                    }
                    finally
                    {
                        if (context.ChangeTracker.HasChanges())
                        {
                            await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
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

        [SuppressMessage("Design", "CA1031: Do not catch general exception types", Justification = "By design")]
        private async void Post(PushMessage message)
        {
            try
            {
                var vt = channel.Writer.WriteAsync(message);
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