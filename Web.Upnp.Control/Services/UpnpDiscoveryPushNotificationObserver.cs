using System;
using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Channels;
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
    public sealed class UpnpDiscoveryPushNotificationObserver : IObserver<UpnpDiscoveryEvent>, IAsyncDisposable
    {
        private readonly IServiceProvider services;
        private IWebPushClient client;
        private readonly ILogger<UpnpDiscoveryPushNotificationObserver> logger;
        private readonly IOptions<JsonOptions> jsonOptions;
        private readonly IOptions<WebPushOptions> wpOptions;
        private CancellationTokenSource cts;
        private readonly Channel<UpnpDiscoveryMessage> channel;
        private readonly WorkerLoop worker;
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
            channel = Channel.CreateBounded<UpnpDiscoveryMessage>(new BoundedChannelOptions(100)
            {
                FullMode = BoundedChannelFullMode.DropOldest,
                SingleReader = true,
                SingleWriter = false
            });

            worker = new WorkerLoop(PostMessageAsync);
            _ = worker.RunAsync(cts.Token);
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
                case UpnpDeviceAppearedEvent dae: Post(new UpnpDiscoveryMessage("appeared", dae.Device)); break;
                case UpnpDeviceDisappearedEvent dde: Post(new UpnpDiscoveryMessage("disappeared", dde.Device)); break;
            }
        }

        [SuppressMessage("Design", "CA1031:Do not catch general exception types", Justification = "Should be never-throw by design")]
        private async void Post(UpnpDiscoveryMessage message)
        {
            try
            {
                var vt = channel.Writer.WriteAsync(message, cts.Token);
                if(!vt.IsCompletedSuccessfully) await vt.ConfigureAwait(false);
            }
            catch(Exception ex)
            {
                logger.LogError(ex, "Error writing message to the queue");
            }
        }

        [SuppressMessage("Design", "CA1031:Do not catch general exception types", Justification = "None of the exceptions should break worker loop")]
        private async Task PostMessageAsync(CancellationToken cancellationToken)
        {
            try
            {
                var message = await channel.Reader.ReadAsync(cancellationToken).ConfigureAwait(false);
                var payload = JsonSerializer.SerializeToUtf8Bytes(message, jsonOptions.Value.SerializerOptions);

                using(var scope = this.services.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<PushSubscriptionDbContext>();

                    try
                    {
                        await foreach(var subscription in context.Subscriptions.AsAsyncEnumerable().WithCancellation(cancellationToken).ConfigureAwait(false))
                        {
                            Uri endpoint = subscription.Endpoint;
                            var keys = new SubscriptionKeys(subscription.P256dhKey, subscription.AuthKey);
                            try
                            {
                                await client.SendAsync(endpoint, keys, payload, wpOptions.Value.TTLSeconds, cancellationToken).ConfigureAwait(false);
                            }
                            catch(OperationCanceledException)
                            {
                                // expected
                            }
                            catch(HttpRequestException hre) when(hre.StatusCode == HttpStatusCode.Gone)
                            {
                                context.Remove(subscription);
                            }
                            catch(Exception ex)
                            {
                                logger.LogError(ex, "Error pushing message to endpoint: " + endpoint);
                            }
                        }
                    }
                    finally
                    {
                        if(context.ChangeTracker.HasChanges())
                        {
                            await context.SaveChangesAsync(cts.Token).ConfigureAwait(false);
                        }
                    }
                }
            }
            catch(OperationCanceledException)
            {
                // expected
            }
            catch(Exception ex)
            {
                logger.LogError(ex, "Error pushing message");
            }
        }

        public async ValueTask DisposeAsync()
        {
            if(!disposed)
            {
                try
                {
                    cts.Cancel();
                    cts.Dispose();
                    await worker.DisposeAsync().ConfigureAwait(false);
                }
                finally
                {
                    disposed = true;
                }
            }
        }
    }
}