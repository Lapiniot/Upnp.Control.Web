using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
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

                        subscriptionTasks.Add(StartSubscriptionAsync(new Uri(rcService.EventsUrl), new Uri(baseUrl + "/rc", UriKind.Relative), sessionTimeout, stoppingToken));
                        subscriptionTasks.Add(StartSubscriptionAsync(new Uri(avtService.EventsUrl), new Uri(baseUrl + "/avt", UriKind.Relative), sessionTimeout, stoppingToken));
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