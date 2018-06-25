using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control.DataAccess;

namespace Web.Upnp.Control.Services
{
    public class UpnpDiscoveryService : IHostedService
    {
        public UpnpDiscoveryService(IServiceProvider services)
        {
            Services = services;
        }

        public IServiceProvider Services { get; }

        #region Implementation of IHostedService

        public Task StartAsync(CancellationToken cancellationToken)
        {
            using(var scoped = Services.CreateScope())
            {
                var context = scoped.ServiceProvider.GetRequiredService<UpnpDbContext>();
                // TODO: discover UPnP devices over network and populate Db
                // TODO: configure and start UPnP multicast listener in order to track device lifetime events
                return Task.CompletedTask;
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        #endregion
    }
}