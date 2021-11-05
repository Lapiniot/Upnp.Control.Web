namespace Upnp.Control.Infrastructure.UpnpEvents;

public interface IUpnpEventSubscriptionFactory
{
    IAsyncCancelable Subscribe(Uri subscribeUri, Uri callbackUri, TimeSpan timeout, CancellationToken stoppingToken = default);
}