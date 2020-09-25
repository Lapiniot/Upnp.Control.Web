using System;
using System.Collections.Generic;

namespace Web.Upnp.Control.Services
{
    public interface IUpnpSubscriptionsRepository
    {
        IEnumerable<IAsyncDisposable> Get(string udn);
        IEnumerable<IAsyncDisposable> GetAll();
        void Add(string udn, params IAsyncDisposable[] sessions);
        bool Remove(string udn, out IEnumerable<IAsyncDisposable> sessions);
        void Clear();
    }
}