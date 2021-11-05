namespace Upnp.Control.Infrastructure.UpnpEvents;

public interface IUpnpEventSubscriptionRepository
{
    IEnumerable<IAsyncCancelable> GetById(string udn);
    IEnumerable<IAsyncCancelable> GetAll();
    void Add(string udn, params IAsyncCancelable[] sessions);
    bool Remove(string udn, out IEnumerable<IAsyncCancelable> sessions);
    void Clear();
}