namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IUpnpEventSubscriptionFactory
    {
        IAsyncCancelable Subscribe(Uri subscribeUri, Uri callbackUri, TimeSpan timeout, CancellationToken stoppingToken = default);
    }
}