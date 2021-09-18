using System.Net;
using System.Text.Json;
using System.Threading.Channels;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Infrastructure.HttpClients;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Models.Events;

namespace Web.Upnp.Control.Services;

public sealed class WebPushSenderService : BackgroundService, IObserver<UpnpDiscoveryEvent>
{
    private readonly IServiceProvider services;
    private readonly ILogger<WebPushSenderService> logger;
    private readonly IOptions<JsonOptions> jsonOptions;
    private readonly IOptions<WebPushOptions> wpOptions;
    private readonly Channel<UpnpDiscoveryMessage> channel;

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

        channel = Channel.CreateBounded<UpnpDiscoveryMessage>(new BoundedChannelOptions(100)
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
        switch(value)
        {
            case UpnpDeviceAppearedEvent dae: Post(new UpnpDiscoveryMessage("appeared", dae.Device)); break;
            case UpnpDeviceDisappearedEvent dde: Post(new UpnpDiscoveryMessage("disappeared", dde.Device)); break;
        }
    }

    #endregion

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while(!stoppingToken.IsCancellationRequested)
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
                    await foreach(var subscription in context.Subscriptions.AsAsyncEnumerable().WithCancellation(stoppingToken).ConfigureAwait(false))
                    {
                        Uri endpoint = subscription.Endpoint;
                        var keys = new SubscriptionKeys(subscription.P256dhKey, subscription.AuthKey);
                        try
                        {
                            await client.SendAsync(endpoint, keys, payload, wpOptions.Value.TTLSeconds, stoppingToken).ConfigureAwait(false);
                        }
                        catch(OperationCanceledException)
                        {
                            // expected
                        }
                        catch(HttpRequestException hre) when(hre.StatusCode is HttpStatusCode.Gone or HttpStatusCode.Forbidden)
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
                        await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
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
                logger.LogWarning("Channel closed. Terminating push dispatch loop.");
                break;
            }
            catch(Exception ex)
            {
                logger.LogError(ex, "Error pushing message");
            }
        }
    }

    private async void Post(UpnpDiscoveryMessage message)
    {
        try
        {
            var vt = channel.Writer.WriteAsync(message);
            if(!vt.IsCompletedSuccessfully) await vt.ConfigureAwait(false);
        }
        catch(Exception ex)
        {
            logger.LogError(ex, "Error writing message to the queue");
        }
    }

    public override void Dispose()
    {
        channel.Writer.TryComplete();
        base.Dispose();
    }
}