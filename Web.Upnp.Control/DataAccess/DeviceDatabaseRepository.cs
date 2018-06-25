using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Web.Upnp.Control.DataAccess
{
    public class DeviceDatabaseRepository : IDeviceRepository
    {
        public UpnpDbContext Context { get; }

        public DeviceDatabaseRepository(UpnpDbContext context)
        {
            Context = context;
        }

        #region Implementation of IDisposable

        public void Dispose()
        {
        }

        #endregion

        #region Implementation of IDeviceRepository

        public Task<IEnumerable<UpnpDevice>> GetAsync()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<UpnpDevice>> GetAsync(string id)
        {
            throw new NotImplementedException();
        }

        public Task AddAsync(IEnumerable<UpnpDevice> devices)
        {
            throw new NotImplementedException();
        }

        public Task RemoveAsync(IEnumerable<UpnpDevice> devices)
        {
            throw new NotImplementedException();
        }

        public Task UpdateAsync(IEnumerable<UpnpDevice> devices)
        {
            throw new NotImplementedException();
        }

        #endregion
    }
}