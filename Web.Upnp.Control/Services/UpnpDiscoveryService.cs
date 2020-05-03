using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
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
        private readonly ILogger<UpnpDiscoveryService> logger;
        private readonly IServiceProvider services;
        private readonly TimeSpan sessionTimeout = TimeSpan.FromMinutes(30);
        private readonly EventSubscribeClient subscribeClient;
        private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> hub;
        private readonly List<Task> subscriptionTasks = new List<Task>();

        public UpnpDiscoveryService(IServiceProvider services, ILogger<UpnpDiscoveryService> logger, EventSubscribeClient subscribeClient,
            IHubContext<UpnpEventsHub, IUpnpEventClient> hub)
        {
            this.services = services;
            this.logger = logger;
            this.subscribeClient = subscribeClient;
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
                await Task.WhenAll(subscriptionTasks).ConfigureAwait(false);
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

            subscriptionTasks.Add(StartSubscriptionAsync(new Uri(rcService.EventsUrl), new Uri(baseUrl + "/rc", UriKind.Relative), sessionTimeout, stoppingToken));
            subscriptionTasks.Add(StartSubscriptionAsync(new Uri(avtService.EventsUrl), new Uri(baseUrl + "/avt", UriKind.Relative), sessionTimeout, stoppingToken));
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

        private async Task StartSubscriptionAsync(Uri subscribeUri, Uri callbackUri, TimeSpan timeout, CancellationToken cancellationToken)
        {
            var (sid, seconds) = await subscribeClient.SubscribeAsync(subscribeUri, callbackUri, timeout, cancellationToken).ConfigureAwait(false);
            logger.LogInformation($"Successfully subscribed to events from {subscribeUri}. SID: {sid}, Timeout: {seconds} seconds.");
            logger.LogInformation($"Starting refresh loop for session: {sid}.");
            while(!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(seconds - 10), cancellationToken).ConfigureAwait(false);
                    logger.LogInformation($"Refreshing subscription for session: {sid}.");
                    (sid, seconds) = await subscribeClient.RenewAsync(subscribeUri, sid, timeout, cancellationToken).ConfigureAwait(false);
                    logger.LogInformation($"Successfully refreshed subscription for session: {sid}. Timeout: {seconds} seconds.");
                }
                catch(HttpRequestException hre)
                {
                    logger.LogWarning($"Failed to refresh subscription for {sid}. {hre.Message}");
                    logger.LogWarning($"Requesting new subscription session at {subscribeUri}.");
                    (sid, seconds) = await subscribeClient.SubscribeAsync(subscribeUri, callbackUri, timeout, cancellationToken).ConfigureAwait(false);
                    logger.LogInformation($"Successfully requested new subscription for {subscribeUri}. SID: {sid}, Timeout: {seconds} seconds.");
                }
                catch(OperationCanceledException)
                {
                    await subscribeClient.UnsubscribeAsync(subscribeUri, sid, default).ConfigureAwait(false);
                    logger.LogInformation($"Successfully cancelled subscription for SID: {sid}.");
                }
            }
        }
    }
}