namespace Upnp.Control.Infrastructure.UpnpEvents;

public interface IEventSubscriptionStore
{
    IEnumerable<IAsyncCancelable> GetById(string udn);
    IEnumerable<IAsyncCancelable> GetAll();
    void Add(string udn, params IAsyncCancelable[] subscriptions);
    bool Remove(string udn, out IEnumerable<IAsyncCancelable> subscriptions);
    void Clear();
}