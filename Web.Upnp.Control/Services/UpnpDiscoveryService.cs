using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using IoT.Device.Xiaomi.Umi.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using Web.Upnp.Control.Services.HttpClients;
using static IoT.Protocol.Upnp.UpnpServices;
using Icon = Web.Upnp.Control.Models.Database.Upnp.Icon;

namespace Web.Upnp.Control.Services
{
    public class UpnpDiscoveryService : BackgroundService
    {
        private readonly EventSubscribeClient subscribeClient;
        private readonly IServiceProvider services;
        private readonly ILogger<UpnpDiscoveryService> logger;

        public UpnpDiscoveryService(IServiceProvider services, ILogger<UpnpDiscoveryService> logger, EventSubscribeClient subscribeClient)
        {
            this.services = services;
            this.logger = logger;
            this.subscribeClient = subscribeClient;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("Started UPnP device discovery service...");

            try
            {
                var enumerator = new UpnpDeviceEnumerator(TimeSpan.FromSeconds(30), RootDevice);

                using var scope = services.CreateScope();
                await using var context = scope.ServiceProvider.GetRequiredService<UpnpDbContext>();

                await foreach(var dev in enumerator.WithCancellation(stoppingToken).ConfigureAwait(false))
                {
                    logger.LogInformation($"New device discovered: {dev.Usn}");
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
                            ControlUrl = s.ControlUri.AbsoluteUri,
                            EventsUrl = s.EventSubscribeUri.AbsoluteUri
                        }).ToList()
                    };

                    if(entity.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema))
                    {
                        var baseUrl = $"api/events/{Uri.EscapeUriString(entity.Udn)}/notify";

                        var rcService = entity.Services.Single(s => s.ServiceType == RenderingControl);
                        var avtService = entity.Services.Single(s => s.ServiceType == AVTransport);

                        await subscribeClient.SubscribeAsync(new Uri(rcService.EventsUrl), new Uri(baseUrl + "/rc", UriKind.Relative), TimeSpan.FromMinutes(5), stoppingToken);
                        await subscribeClient.SubscribeAsync(new Uri(avtService.EventsUrl), new Uri(baseUrl + "/avt", UriKind.Relative), TimeSpan.FromMinutes(5), stoppingToken);
                    }

                    await context.AddAsync(entity, stoppingToken).ConfigureAwait(false);
                    await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
                }
            }
            catch(Exception ex)
            {
                logger.LogError(ex, "Error discovering UPnP devices and services!");
            }
        }
    }
}