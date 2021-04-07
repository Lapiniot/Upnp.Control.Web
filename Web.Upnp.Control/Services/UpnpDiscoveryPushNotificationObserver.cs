using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Infrastructure.HttpClients;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Models.Events;

namespace Web.Upnp.Control.Services
{
    public sealed class UpnpDiscoveryPushNotificationObserver : IObserver<UpnpDiscoveryEvent>, IDisposable
    {
        private readonly IServiceProvider services;
        private Infrastructure.HttpClients.WebPushClient client;
        private readonly ILogger<UpnpDiscoveryPushNotificationObserver> logger;
        private readonly IOptions<JsonOptions> options;
        private CancellationTokenSource cts;
        private SemaphoreSlim sentinel;
        private bool disposed;

        public UpnpDiscoveryPushNotificationObserver(IServiceProvider services, WebPushClient client,
            ILogger<UpnpDiscoveryPushNotificationObserver> logger, IOptions<JsonOptions> options)
        {
            this.services = services ?? throw new ArgumentNullException(nameof(services));
            this.client = client ?? throw new ArgumentNullException(nameof(client));
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.options = options ?? throw new ArgumentNullException(nameof(options));
            cts = new CancellationTokenSource();
            sentinel = new SemaphoreSlim(4);
        }

        public void OnCompleted()
        {
        }

        public void OnError(Exception error)
        {
        }

        public void OnNext(UpnpDiscoveryEvent value)
        {
            switch(value)
            {
                case UpnpDeviceAppearedEvent dae: _ = SendAsync(new UpnpDiscoveryMessage("appeared", dae.Device), cts.Token); break;
                case UpnpDeviceDisappearedEvent dde: _ = SendAsync(new UpnpDiscoveryMessage("disappeared", dde.Device), cts.Token); break;
            }
        }

        private async Task SendAsync(UpnpDiscoveryMessage message, CancellationToken cancellationToken)
        {
            var payload = JsonSerializer.SerializeToUtf8Bytes(message, options.Value.SerializerOptions);

            using(var scope = this.services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<PushSubscriptionDbContext>();

                await foreach(var subscription in context.Subscriptions.AsAsyncEnumerable().WithCancellation(cancellationToken).ConfigureAwait(false))
                {
                    await sentinel.WaitAsync(cancellationToken).ConfigureAwait(false);
                    var keys = new System.Net.Http.SubscriptionKeys(subscription.P256dhKey, subscription.AuthKey);
                    _ = PushAsync(subscription.Endpoint, keys, payload, cancellationToken).ContinueWith(t => sentinel.Release());
                }
            }
        }

        private async Task PushAsync(Uri endpoint, System.Net.Http.SubscriptionKeys keys, byte[] payload, CancellationToken cancellationToken)
        {
            try
            {
                await client.SendAsync(endpoint, keys, payload, cancellationToken).ConfigureAwait(false);
            }
            catch(OperationCanceledException)
            {
                // expected
            }
            catch(Exception ex)
            {
                logger.LogError(ex, "Error pushing message to endpoint: " + endpoint);
                throw;
            }
        }

        public void Dispose()
        {
            if(!disposed)
            {
                cts.Cancel();
                cts.Dispose();
                sentinel.Dispose();
                disposed = true;
            }
        }
    }
}