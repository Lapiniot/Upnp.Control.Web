using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using IoT.Protocol;
using IoT.Protocol.Upnp;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;

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

                    var devices = tasks.Where(task => task.IsCompletedSuccessfully).Select(task => task.Result).Select(dev => new Device
                    {
                        Udn = dev.Udn,
                        Location = dev.Location.AbsoluteUri,
                        DeviceType = dev.DeviceType,
                        FriendlyName = dev.FriendlyName,
                        Manufacturer = dev.Manufacturer,
                        Description = dev.ModelDescription,
                        ModelName = dev.ModelName,
                        ModelNumber = dev.ModelNumber,
                        IsOnline = true,
                        Icons = dev.Icons.Select(i => new Icon
                        {
                            Width = i.Width,
                            Height = i.Height,
                            Mime = i.Mime,
                            Url = i.Uri.AbsoluteUri
                        }).ToList(),
                        Services = dev.Services.Select(s => new Service
                        {
                            ServiceId = s.ServiceId,
                            ServiceType = s.ServiceType,
                            MetadataUrl = s.MetadataUri.AbsoluteUri,
                            ControlUrl = s.ControlUri.AbsoluteUri
                        }).ToList()
                    });

                    await context.AddRangeAsync(devices, cancellationToken).ConfigureAwait(false);

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