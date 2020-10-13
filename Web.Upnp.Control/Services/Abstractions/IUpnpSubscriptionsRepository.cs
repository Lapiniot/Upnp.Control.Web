using System.Collections.Generic;
using System.Threading;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IUpnpSubscriptionsRepository
    {
        IEnumerable<IAsyncCancelable> Get(string udn);
        IEnumerable<IAsyncCancelable> GetAll();
        void Add(string udn, params IAsyncCancelable[] sessions);
        bool Remove(string udn, out IEnumerable<IAsyncCancelable> sessions);
        void Clear();
    }
}