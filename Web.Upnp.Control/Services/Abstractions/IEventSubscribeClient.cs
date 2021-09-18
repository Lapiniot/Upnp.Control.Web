namespace Web.Upnp.Control.Services.Abstractions;

public interface IEventSubscribeClient
{
    Task<(string Sid, int Timeout)> RenewAsync(Uri subscribeUri, string sid, TimeSpan timeout, CancellationToken cancellationToken);
    Task<(string Sid, int Timeout)> SubscribeAsync(Uri subscribeUri, Uri deliveryUri, TimeSpan timeout, CancellationToken cancellationToken = default);
    Task UnsubscribeAsync(Uri subscribeUri, string sid, CancellationToken cancellationToken);
}