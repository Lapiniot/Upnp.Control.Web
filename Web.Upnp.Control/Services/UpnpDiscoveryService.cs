using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp;
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
        private readonly ILogger<UpnpDiscoveryService> logger;
        private readonly IServiceProvider services;
        private readonly TimeSpan sessionTimeout = TimeSpan.FromMinutes(30);
        private readonly EventSubscribeClient subscribeClient;
        private readonly List<Task> subscriptionTasks = new List<Task>();

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
                using var scope = services.CreateScope();
                await using var context = scope.ServiceProvider.GetRequiredService<UpnpDbContext>();

                var enumerator = new SsdpEventEnumerator(TimeSpan.FromSeconds(120), RootDevice);
                await foreach(var reply in enumerator.WithCancellation(stoppingToken).ConfigureAwait(false))
                {
                    if(reply.StartLine.StartsWith("M-SEARCH")) continue;

                    if(reply.StartLine.StartsWith("NOTIFY"))
                    {
                        if(reply.TryGetValue("NT", out var nt))
                        {
                            if(nt != RootDevice)
                            {
                                continue;
                            }
                            logger.LogInformation($"NOTIFY {nt}: {reply.MaxAge} sec.");
                        }
                    }

                    var entity = await context.FindAsync<Device>(reply.UniqueDeviceName).ConfigureAwait(false);

                    if(entity != null)
                    {
                        entity.ExpiresAt = DateTime.UtcNow.AddSeconds(reply.MaxAge + 10);
                        context.Update(entity);
                        await context.SaveChangesAsync().ConfigureAwait(false);
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
            return new Device
            {
                Udn = device.Udn,
                Location = device.Location.AbsoluteUri,
                DeviceType = device.DeviceType,
                FriendlyName = device.FriendlyName,
                Manufacturer = device.Manufacturer,
                Description = device.ModelDescription,
                ModelName = device.ModelName,
                ModelNumber = device.ModelNumber,
                IsOnline = true,
                Icons = device.Icons.Select(i => new Icon
                {
                    Width = i.Width,
                    Height = i.Height,
                    Mime = i.Mime,
                    Url = i.Uri.AbsoluteUri
                }).ToList(),
                Services = device.Services.Select(s => new Service
                {
                    ServiceId = s.ServiceId,
                    ServiceType = s.ServiceType,
                    MetadataUrl = s.MetadataUri.AbsoluteUri,
                    ControlUrl = s.ControlUri.AbsoluteUri,
                    EventsUrl = s.EventSubscribeUri.AbsoluteUri
                }).ToList()
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