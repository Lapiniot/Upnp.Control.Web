using System;
using System.Collections.Generic;
using System.Linq;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services
{
    internal class InMemorySubscriptionsRepository : IUpnpSubscriptionsRepository
    {
        private readonly Dictionary<string, List<IAsyncDisposable>> storage = new Dictionary<string, List<IAsyncDisposable>>();

        public InMemorySubscriptionsRepository()
        {
            storage = new Dictionary<string, List<IAsyncDisposable>>();
        }

        public void Add(string udn, params IAsyncDisposable[] sessions)
        {
            lock(storage)
            {
                if(storage.TryGetValue(udn, out var list))
                {
                    list.AddRange(sessions);
                }
                else
                {
                    storage[udn] = new List<IAsyncDisposable>(sessions);
                }
            }
        }

        public void Clear()
        {
            lock(storage)
            {
                storage.Clear();
            }
        }

        public IEnumerable<IAsyncDisposable> Get(string udn)
        {
            lock(storage)
            {
                return storage.TryGetValue(udn, out var list) ? list : Array.Empty<IAsyncDisposable>();
            }
        }

        public IEnumerable<IAsyncDisposable> GetAll()
        {
            lock(storage)
            {
                return storage.Values.SelectMany(v => v).ToList();
            }
        }

        public bool Remove(string udn, out IEnumerable<IAsyncDisposable> sessions)
        {
            lock(storage)
            {
                if(storage.Remove(udn, out var list))
                {
                    sessions = list;
                    return true;
                }
                else
                {
                    sessions = null;
                    return false;
                }
            }
        }
    }
}