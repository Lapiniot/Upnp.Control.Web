using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using static IoT.Protocol.Upnp.UpnpServices;

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
            using(var tcs = new CancellationTokenSource(10000))
            {
                var enumerator = new UpnpDeviceEnumerator(TimeSpan.FromSeconds(5), RootDevice);
                await enumerator.DiscoverAsync(OnDiscovered, tcs.Token).ConfigureAwait(false);
            }
        }

        private async void OnDiscovered(UpnpDevice device)
        {
            using(var scoped = Services.CreateScope())
            {
                using(var context = scoped.ServiceProvider.GetRequiredService<UpnpDbContext>())
                {
                    // TODO: configure and start UPnP multi-cast listener in order to track device lifetime events
                    var description = await device.GetDescriptionAsync();

                    var entity = new Device
                    {
                        Udn = description.Udn,
                        Location = description.Location.AbsoluteUri,
                        DeviceType = description.DeviceType,
                        FriendlyName = description.FriendlyName,
                        Manufacturer = description.Manufacturer,
                        Description = description.ModelDescription,
                        ModelName = description.ModelName,
                        ModelNumber = description.ModelNumber,
                        IsOnline = true,
                        Icons = description.Icons.Select(i => new Icon
                        {
                            Width = i.Width,
                            Height = i.Height,
                            Mime = i.Mime,
                            Url = i.Uri.AbsoluteUri
                        }).ToList(),
                        Services = description.Services.Select(s => new Service
                        {
                            ServiceId = s.ServiceId,
                            ServiceType = s.ServiceType,
                            MetadataUrl = s.MetadataUri.AbsoluteUri,
                            ControlUrl = s.ControlUri.AbsoluteUri
                        }).ToList()
                    };

                    await context.AddAsync(entity).ConfigureAwait(false);

                    await context.SaveChangesAsync().ConfigureAwait(false);
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