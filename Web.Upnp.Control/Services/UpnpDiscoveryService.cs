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
    public class UpnpDiscoveryService : IHostedService, IDisposable
    {
        private Task monitorTask;
        private CancellationTokenSource tcs;

        public UpnpDiscoveryService(IServiceProvider services)
        {
            Services = services;
        }

        public IServiceProvider Services { get; }

        #region Implementation of IDisposable

        public void Dispose() {}

        #endregion

        #region Implementation of IHostedService

        public Task StartAsync(CancellationToken cancellationToken)
        {
            tcs = new CancellationTokenSource();
            monitorTask = StartMonitorAsync(tcs.Token);
            return Task.CompletedTask;
        }

        private async Task StartMonitorAsync(CancellationToken cancellationToken)
        {
            var enumerator = new UpnpDeviceEnumerator(TimeSpan.FromSeconds(30), RootDevice);

            using(var scope = Services.CreateScope())
            using(var context = scope.ServiceProvider.GetRequiredService<UpnpDbContext>())
            {
                await enumerator.DiscoverAsync(device => DiscoveredAsync(device, (context, cancellationToken)), cancellationToken);
            }
        }

        private async Task DiscoveredAsync(UpnpDevice dev, (UpnpDbContext context, CancellationToken cancellationToken) state)
        {
            var (ctx, token) = state;

            var description = await dev.GetDescriptionAsync(token).ConfigureAwait(false);

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

            await ctx.AddAsync(entity, token).ConfigureAwait(false);

            await ctx.SaveChangesAsync(token).ConfigureAwait(false);
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            using(tcs)
            {
                tcs.Cancel();
                await monitorTask.ConfigureAwait(false);
            }
        }

        #endregion
    }
}