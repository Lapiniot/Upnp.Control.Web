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
        private readonly UpnpDbContext ctx;
        private Task enumTask;
        private CancellationTokenSource tcs;

        public UpnpDiscoveryService(IServiceProvider services)
        {
            Services = services;
        }

        public IServiceProvider Services { get; }

        #region Implementation of IHostedService

        public Task StartAsync(CancellationToken cancellationToken)
        {
            tcs = new CancellationTokenSource();
            var enumerator = new UpnpDeviceEnumerator(TimeSpan.FromSeconds(30), RootDevice);
            enumTask = enumerator.DiscoverAsync(OnDiscovered, cancellationToken);
            return enumTask;
            /**/
        }

        private async void OnDiscovered(UpnpDevice device)
        {
            using(var scoped = Services.CreateScope())
            {
                using(var context = scoped.ServiceProvider.GetRequiredService<UpnpDbContext>())
                {
                    // TODO: configure and start UPnP multi-cast listener in order to track device lifetime events
                    var description = await device.GetDescriptionAsync(tcs.Token);

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

                    await context.AddAsync(entity, tcs.Token).ConfigureAwait(false);

                    await context.SaveChangesAsync(tcs.Token).ConfigureAwait(false);
                }
            }
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            using(tcs)
            {
                tcs.Cancel();
                await enumTask.ConfigureAwait(false);
            }
        }

        #endregion
    }
}