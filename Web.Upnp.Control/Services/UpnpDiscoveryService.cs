using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using IoT.Device.Xiaomi.Umi;
using IoT.Protocol;
using IoT.Protocol.Upnp;
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

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            using(var scoped = Services.CreateScope())
            {
                using(var context = scoped.ServiceProvider.GetRequiredService<UpnpDbContext>())
                {

                    // TODO: configure and start UPnP multicast listener in order to track device lifetime events

                    var upnpDevices = new UpnpDeviceEnumerator(UpnpServices.RootDevice).Enumerate(TimeSpan.FromSeconds(3), cancellationToken);

                    cancellationToken.ThrowIfCancellationRequested();

                    var tasks = upnpDevices.Select(d => d.GetDescriptionAsync(cancellationToken)).ToList();

                    cancellationToken.ThrowIfCancellationRequested();

                    await Task.WhenAll(tasks).ConfigureAwait(false);

                    cancellationToken.ThrowIfCancellationRequested();

                    await context.AddRangeAsync(tasks.Where(t => t.IsCompletedSuccessfully).Select(t => new DataAccess.UpnpDevice
                    {
                        Udn = t.Result.Udn,
                        Location = t.Result.Location.AbsoluteUri,
                        DeviceType = t.Result.DeviceType,
                        FriendlyName = t.Result.FriendlyName,
                        Manufacturer = t.Result.Manufacturer,
                        Description = t.Result.ModelDescription,
                        ModelName = t.Result.ModelName,
                        ModelNumber = t.Result.ModelNumber,
                        IsOnline = true,
                        Icons = t.Result.Icons.Select(i => new UpnpDeviceIcon { Width = i.Width, Height = i.Height, Mime = i.Mime, Url = i.Uri.AbsoluteUri }).ToList(),
                        Services = t.Result.Services.Select(s => new UpnpService { ServiceId = s.ServiceId, Url = s.MetadataUri.AbsoluteUri }).ToList()
                    }));

                    await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
                }
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        #endregion
    }
}