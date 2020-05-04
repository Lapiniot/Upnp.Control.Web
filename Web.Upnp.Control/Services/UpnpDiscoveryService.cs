using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Hubs;
using Web.Upnp.Control.Models.Database.Upnp;
using Web.Upnp.Control.Services.HttpClients;
using static IoT.Protocol.Upnp.UpnpServices;
using Icon = Web.Upnp.Control.Models.Database.Upnp.Icon;

namespace Web.Upnp.Control.Services
{
    public class UpnpDiscoveryService : BackgroundService
    {
        private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> hub;
        private readonly ILogger<UpnpDiscoveryService> logger;
        private readonly IServiceProvider services;
        private readonly EventSessionFactory sessionFactory;
        private readonly IDictionary<string, IAsyncDisposable[]> sessions = new Dictionary<string, IAsyncDisposable[]>();
        private readonly TimeSpan sessionTimeout = TimeSpan.FromMinutes(30);

        public UpnpDiscoveryService(IServiceProvider services, ILoggerFactory factory, EventSubscribeClient subscribeClient,
            IHubContext<UpnpEventsHub, IUpnpEventClient> hub)
        {
            this.services = services;
            logger = factory.CreateLogger<UpnpDiscoveryService>();
            sessionFactory = new EventSessionFactory(subscribeClient, factory.CreateLogger<EventSessionFactory>());
            this.hub = hub;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("Started UPnP device discovery service...");

            try
            {
                using var scope = services.CreateScope();
                await using var context = scope.ServiceProvider.GetRequiredService<UpnpDbContext>();

                var enumerator = new SsdpEventEnumerator(TimeSpan.FromSeconds(120), RootDevice);
                await foreach(var reply in enumerator.WithCancellation(stoppingToken).ConfigureAwait(false))
                {
                    if(reply.StartLine.StartsWith("M-SEARCH") || reply.TryGetValue("NT", out var nt) && nt != RootDevice)
                    {
                        continue;
                    }

                    var udn = reply.UniqueDeviceName;

                    var entity = await context.FindAsync<Device>(udn).ConfigureAwait(false);

                    if(reply.StartLine.StartsWith("NOTIFY") && reply.TryGetValue("NTS", out var nts) && nts == "ssdp:byebye")
                    {
                        if(entity != null)
                        {
                            context.Remove(entity);
                            await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
                            var _ = hub.Clients.All.SsdpDiscoveryEvent(udn, "disappeared");
                        }

                        continue;
                    }

                    if(entity != null)
                    {
                        entity.ExpiresAt = DateTime.UtcNow.AddSeconds(reply.MaxAge + 10);
                        context.Update(entity);
                        await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
                        continue;
                    }

                    var dev = new UpnpDevice(new Uri(reply.Location), reply.UniqueServiceName);

                    logger.LogInformation($"New device discovered: {dev.Usn}");

                    entity = MapConvert(await dev.GetDescriptionAsync(stoppingToken).ConfigureAwait(false));
                    entity.ExpiresAt = DateTime.UtcNow.AddSeconds(reply.MaxAge + 10);

                    if(entity.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema))
                    {
                        SubscribeToEvents(entity, stoppingToken);
                    }

                    await context.AddAsync(entity, stoppingToken).ConfigureAwait(false);
                    await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
                    _ = hub.Clients.All.SsdpDiscoveryEvent(udn, "appeared");
                }
            }
            catch(OperationCanceledException)
            {
                foreach(var (_, subscriptions) in sessions)
                {
                    foreach(var disposable in subscriptions)
                    {
                        try
                        {
                            await disposable.DisposeAsync().ConfigureAwait(false);
                        }
                        catch(Exception exception)
                        {
                            logger.LogError(exception, "Error cancelling subscribe session");
                        }
                    }
                }
            }
            catch(Exception ex)
            {
                logger.LogError(ex, "Error discovering UPnP devices and services!");
            }
        }

        private void SubscribeToEvents(Device entity, CancellationToken stoppingToken)
        {
            var baseUrl = $"api/events/{Uri.EscapeUriString(entity.Udn)}/notify";

            var rcService = entity.Services.Single(s => s.ServiceType == RenderingControl);
            var avtService = entity.Services.Single(s => s.ServiceType == AVTransport);

            sessions.Add(entity.Udn, new[]
            {
                sessionFactory.StartSession(new Uri(rcService.EventsUrl), new Uri(baseUrl + "/rc", UriKind.Relative), sessionTimeout, stoppingToken),
                sessionFactory.StartSession(new Uri(avtService.EventsUrl), new Uri(baseUrl + "/avt", UriKind.Relative), sessionTimeout, stoppingToken)
            });
        }

        private static Device MapConvert(UpnpDeviceDescription device)
        {
            return new Device(device.Udn, device.Location.AbsoluteUri, device.DeviceType, device.FriendlyName, device.Manufacturer,
                device.ModelDescription, device.ModelName, device.ModelNumber)
            {
                IsOnline = true,
                Icons = device.Icons.Select(i => new Icon(i.Width, i.Height, i.Uri.AbsoluteUri, i.Mime)).ToList(),
                Services = device.Services.Select(s => new Service(s.ServiceId, s.MetadataUri.AbsoluteUri,
                    s.ServiceType, s.ControlUri.AbsoluteUri, s.EventSubscribeUri.AbsoluteUri)).ToList()
            };
        }
    }
}