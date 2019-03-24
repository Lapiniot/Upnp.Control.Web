using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using static IoT.Protocol.Upnp.UpnpServices;

namespace Web.Upnp.Control.Services
{
    public class UpnpDiscoveryService : BackgroundService
    {
        public UpnpDiscoveryService(IServiceProvider services, ILogger<UpnpDiscoveryService> logger)
        {
            Services = services;
            Logger = logger;
        }

        public IServiceProvider Services { get; }
        public ILogger<UpnpDiscoveryService> Logger { get; }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Logger.LogInformation("Started UPnP device discovery service...");

            try
            {
                var enumerator = new UpnpDeviceEnumerator(TimeSpan.FromSeconds(30), RootDevice);

                using var scope = Services.CreateScope();
                using var context = scope.ServiceProvider.GetRequiredService<UpnpDbContext>();

                await foreach(var dev in enumerator.WithCancellation(stoppingToken).ConfigureAwait(false))
                {
                    Logger.LogInformation($"New device discovered: {dev.Usn}");
                    var d = await dev.GetDescriptionAsync(stoppingToken).ConfigureAwait(false);
                    var entity = new Device
                    {
                        Udn = d.Udn,
                        Location = d.Location.AbsoluteUri,
                        DeviceType = d.DeviceType,
                        FriendlyName = d.FriendlyName,
                        Manufacturer = d.Manufacturer,
                        Description = d.ModelDescription,
                        ModelName = d.ModelName,
                        ModelNumber = d.ModelNumber,
                        IsOnline = true,
                        Icons = d.Icons.Select(i => new Icon
                        {
                            Width = i.Width,
                            Height = i.Height,
                            Mime = i.Mime,
                            Url = i.Uri.AbsoluteUri
                        }).ToList(),
                        Services = d.Services.Select(s => new Service
                        {
                            ServiceId = s.ServiceId,
                            ServiceType = s.ServiceType,
                            MetadataUrl = s.MetadataUri.AbsoluteUri,
                            ControlUrl = s.ControlUri.AbsoluteUri
                        }).ToList()
                    };

                    await context.AddAsync(entity, stoppingToken).ConfigureAwait(false);
                    await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
                }
            }
            catch(Exception ex)
            {
                Logger.LogError(ex, "Error discovering UPnP devices and services!");
            }
        }
    }
}