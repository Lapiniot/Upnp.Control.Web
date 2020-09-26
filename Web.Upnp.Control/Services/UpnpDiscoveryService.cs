using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using IoT.Protocol.Upnp;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using Icon = Web.Upnp.Control.Models.Database.Upnp.Icon;

namespace Web.Upnp.Control.Services
{
    // TODO: Refactor this service! The only responsibility should be observers notification in response to the discovery database changes
    public class UpnpDiscoveryService : BackgroundService
    {
        private readonly ILogger<UpnpDiscoveryService> logger;
        private readonly IServiceProvider services;
        private readonly IObserver<UpnpDiscoveryEvent>[] observers;

        public UpnpDiscoveryService(IServiceProvider services, ILogger<UpnpDiscoveryService> logger,
            IEnumerable<IObserver<UpnpDiscoveryEvent>> observers = null)
        {
            this.services = services ?? throw new ArgumentNullException(nameof(services));
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.observers = observers?.ToArray() ?? Array.Empty<IObserver<UpnpDiscoveryEvent>>();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("Started UPnP device discovery service...");

            try
            {
                using var scope = services.CreateScope();

                await using var context = scope.ServiceProvider.GetRequiredService<UpnpDbContext>();

                var enumerator = scope.ServiceProvider.GetRequiredService<IAsyncEnumerable<SsdpReply>>();

                await foreach(var reply in enumerator.WithCancellation(stoppingToken).ConfigureAwait(false))
                {
                    try
                    {
                        if(reply.StartLine.StartsWith("M-SEARCH"))
                        {
                            continue;
                        }

                        if(reply.StartLine.StartsWith("NOTIFY"))
                        {
                            if(reply.TryGetValue("NTS", out var nts) && nts == "ssdp:byebye")
                            {
                                if(reply.TryGetValue("NT", out var nt))
                                {
                                    var id = nt == "upnp:rootdevice" ? reply.UniqueDeviceName : nt;
                                    var existing = await context.FindAsync<Device>(id).ConfigureAwait(false);
                                    if(existing != null)
                                    {
                                        context.Remove(existing);
                                        await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);

                                        foreach(var observer in observers)
                                        {
                                            observer.OnNext(new UpnpDeviceDisappearedEvent(nt));
                                        }
                                    }

                                    continue;
                                }
                            }
                        }
                        else if(reply.StartLine.StartsWith("HTTP"))
                        {

                        }

                        var udn = reply.UniqueDeviceName;

                        var entity = await context.FindAsync<Device>(udn).ConfigureAwait(false);

                        if(entity != null)
                        {
                            entity.ExpiresAt = DateTime.UtcNow.AddSeconds(reply.MaxAge + 10);
                            context.Update(entity);
                            await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
                            continue;
                        }

                        var dev = new UpnpDevice(new Uri(reply.Location), reply.UniqueServiceName);

                        logger.LogInformation($"New device discovered: {dev.Usn}");

                        var description = await dev.GetDescriptionAsync(stoppingToken).ConfigureAwait(false);
                        entity = MapConvert(description);
                        entity.ExpiresAt = DateTime.UtcNow.AddSeconds(reply.MaxAge + 10);

                        await context.AddAsync(entity, stoppingToken).ConfigureAwait(false);
                        await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);

                        foreach(var observer in observers)
                        {
                            observer.OnNext(new UpnpDeviceAppearedEvent(udn, description));
                        }
                    }
                    catch(Exception exception)
                    {
                        logger.LogError(exception, $"Error processing SSDP reply {reply.StartLine} for USN={reply.UniqueServiceName}");
                    }
                }
            }
            catch(OperationCanceledException)
            {
            }
            catch(Exception ex)
            {
                logger.LogError(ex, "Error discovering UPnP devices and services!");
            }
            finally
            {
                foreach(var observer in observers)
                {
                    observer.OnCompleted();
                }
            }
        }

        private static Device MapConvert(UpnpDeviceDescription device)
        {
            return new Device(device.Udn, device.Location, device.DeviceType, device.FriendlyName, device.Manufacturer,
                device.ModelDescription, device.ModelName, device.ModelNumber)
            {
                IsOnline = true,
                Icons = device.Icons.Select(i => new Icon(i.Width, i.Height, i.Uri.AbsoluteUri, i.Mime)).ToList(),
                Services = device.Services.Select(s => new Service(s.ServiceId,
                    s.ServiceType, s.MetadataUri, s.ControlUri, s.EventSubscribeUri)).ToList()
            };
        }
    }
}