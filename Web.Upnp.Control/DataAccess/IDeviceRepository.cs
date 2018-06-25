using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Web.Upnp.Control.DataAccess
{
    public interface IDeviceRepository : IDisposable
    {
        Task<IEnumerable<UpnpDevice>> GetAsync();
        Task<IEnumerable<UpnpDevice>> GetAsync(string id);
        Task AddAsync(IEnumerable<UpnpDevice> devices);
        Task RemoveAsync(IEnumerable<UpnpDevice> devices);
        Task UpdateAsync(IEnumerable<UpnpDevice> devices);
    }
}