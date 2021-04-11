using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Infrastructure.HttpClients;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Models.Events;

namespace Web.Upnp.Control.Services
{
    public sealed class UpnpDiscoveryPushNotificationObserver : IObserver<UpnpDiscoveryEvent>, IDisposable
    {
        private readonly IServiceProvider services;
        private IWebPushClient client;
        private readonly ILogger<UpnpDiscoveryPushNotificationObserver> logger;
        private readonly IOptions<JsonOptions> jsonOptions;
        private readonly IOptions<WebPushOptions> wpOptions;
        private CancellationTokenSource cts;
        private SemaphoreSlim sentinel;
        private bool disposed;

        public UpnpDiscoveryPushNotificationObserver(IServiceProvider services, IWebPushClient client,
            ILogger<UpnpDiscoveryPushNotificationObserver> logger,
            IOptions<JsonOptions> jsonOptions, IOptions<WebPushOptions> wpOptions)
        {
            this.services = services ?? throw new ArgumentNullException(nameof(services));
            this.client = client ?? throw new ArgumentNullException(nameof(client));
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.jsonOptions = jsonOptions ?? throw new ArgumentNullException(nameof(jsonOptions));
            this.wpOptions = wpOptions ?? throw new ArgumentNullException(nameof(wpOptions));

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
            var payload = JsonSerializer.SerializeToUtf8Bytes(message, jsonOptions.Value.SerializerOptions);

            using(var scope = this.services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<PushSubscriptionDbContext>();

                await foreach(var subscription in context.Subscriptions.AsAsyncEnumerable().WithCancellation(cancellationToken).ConfigureAwait(false))
                {
                    await sentinel.WaitAsync(cancellationToken).ConfigureAwait(false);
                    var keys = new System.Net.Http.SubscriptionKeys(subscription.P256dhKey, subscription.AuthKey);
                    _ = PushAsync(subscription.Endpoint, keys, payload, cancellationToken)
                        .ContinueWith(t => sentinel.Release(), default, TaskContinuationOptions.ExecuteSynchronously, TaskScheduler.Default);
                }
            }
        }

        private async Task PushAsync(Uri endpoint, System.Net.Http.SubscriptionKeys keys, byte[] payload, CancellationToken cancellationToken)
        {
            try
            {
                await client.SendAsync(endpoint, keys, payload, wpOptions.Value.TTLSeconds, cancellationToken).ConfigureAwait(false);
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