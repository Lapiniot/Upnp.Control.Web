namespace Upnp.Control.Infrastructure.UpnpEvents;

internal sealed class InMemoryEventSubscriptionStore : IEventSubscriptionStore
{
    private readonly Dictionary<string, List<IAsyncCancelable>> storage;

    public InMemoryEventSubscriptionStore() => storage = [];

    public void Add(string udn, params IAsyncCancelable[] sessions)
    {
        lock (storage)
        {
            if (storage.TryGetValue(udn, out var list))
            {
                list.AddRange(sessions);
            }
            else
            {
                storage[udn] = [.. sessions];
            }
        }
    }

    public void Clear()
    {
        lock (storage)
        {
            storage.Clear();
        }
    }

    public IEnumerable<IAsyncCancelable> GetById(string udn)
    {
        lock (storage)
        {
            return storage.TryGetValue(udn, out var list) ? list : Array.Empty<IAsyncCancelable>();
        }
    }

    public IEnumerable<IAsyncCancelable> GetAll()
    {
        lock (storage)
        {
            return [.. storage.Values.SelectMany(v => v)];
        }
    }

    public bool Remove(string udn, out IEnumerable<IAsyncCancelable> sessions)
    {
        lock (storage)
        {
            if (storage.Remove(udn, out var list))
            {
                sessions = list;
                return true;
            }

            sessions = null;
            return false;
        }
    }
}