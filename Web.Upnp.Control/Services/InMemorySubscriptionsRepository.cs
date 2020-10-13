using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services
{
    internal class InMemorySubscriptionsRepository : IUpnpSubscriptionsRepository
    {
        private readonly Dictionary<string, List<IAsyncCancelable>> storage = new Dictionary<string, List<IAsyncCancelable>>();

        public InMemorySubscriptionsRepository()
        {
            storage = new Dictionary<string, List<IAsyncCancelable>>();
        }

        public void Add(string udn, params IAsyncCancelable[] sessions)
        {
            lock(storage)
            {
                if(storage.TryGetValue(udn, out var list))
                {
                    list.AddRange(sessions);
                }
                else
                {
                    storage[udn] = new List<IAsyncCancelable>(sessions);
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

        public IEnumerable<IAsyncCancelable> Get(string udn)
        {
            lock(storage)
            {
                return storage.TryGetValue(udn, out var list) ? list : Array.Empty<IAsyncCancelable>();
            }
        }

        public IEnumerable<IAsyncCancelable> GetAll()
        {
            lock(storage)
            {
                return storage.Values.SelectMany(v => v).ToList();
            }
        }

        public bool Remove(string udn, out IEnumerable<IAsyncCancelable> sessions)
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