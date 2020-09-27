using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using Web.Upnp.Control.Services.Abstractions;
using Icon = Web.Upnp.Control.Models.Database.Upnp.Icon;

namespace Web.Upnp.Control.Services
{
    // TODO: Refactor this service! The only responsibility should be observers notification in response to the discovery database changes
    public class UpnpDiscoveryService : BackgroundService
    {
        private const string RootDevice = "upnp:rootdevice";
        private readonly ILogger<UpnpDiscoveryService> logger;
        private readonly IUpnpServiceMetadataProvider metadataProvider;
        private readonly IServiceProvider services;
        private readonly IObserver<UpnpDiscoveryEvent>[] observers;

        public UpnpDiscoveryService(IServiceProvider services, ILogger<UpnpDiscoveryService> logger,
            IUpnpServiceMetadataProvider metadataProvider, IEnumerable<IObserver<UpnpDiscoveryEvent>> observers = null)
        {
            this.services = services ?? throw new ArgumentNullException(nameof(services));
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.metadataProvider = metadataProvider ?? throw new ArgumentNullException(nameof(metadataProvider));
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
                        if(reply.StartLine.StartsWith("M-SEARCH")) continue;

                        DebugDump(reply);

                        var udn = ExtractUdn(reply.UniqueServiceName);

                        if(reply.StartLine.StartsWith("NOTIFY") && reply.TryGetValue("NT", out var nt))
                        {
                            if(nt != RootDevice) continue;

                            if(reply.TryGetValue("NTS", out var nts) && nts == "ssdp:byebye")
                            {
                                var existing = await context.FindAsync<Device>(udn).ConfigureAwait(false);
                                if(existing != null)
                                {
                                    context.Remove(existing);
                                    await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
                                    Notify(new UpnpDeviceDisappearedEvent(udn));
                                }

                                continue;
                            }
                        }
                        else if(reply.TryGetValue("ST", out var st) && st != RootDevice)
                        {
                            continue;
                        }

                        var entity = await context.FindAsync<Device>(udn).ConfigureAwait(false);

                        if(entity != null)
                        {
                            entity.ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(reply.MaxAge + 10);
                            context.Update(entity);
                            await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
                            logger.LogInformation($"Device expiration updated for UDN='{udn}'");
                            continue;
                        }

                        var description = await metadataProvider.GetDescriptionAsync(new Uri(reply.Location), stoppingToken).ConfigureAwait(false);
                        entity = MapConvert(description);
                        entity.Udn = udn;
                        entity.ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(reply.MaxAge + 10);

                        await context.AddAsync(entity, stoppingToken).ConfigureAwait(false);
                        await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);

                        logger.LogInformation($"New device discovered with UDN='{description.Udn}'");

                        Notify(new UpnpDeviceAppearedEvent(udn, description));
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
                NotifyCompletion();
            }
        }

        private static void DebugDump(SsdpReply reply)
        {
            Console.WriteLine($"***** {reply.StartLine} *****");
            foreach(var item in reply)
            {
                Console.WriteLine($"{item.Key}: {item.Value}");
            }
            Console.WriteLine();
        }

        private string ExtractUdn(string usn)
        {
            var i1 = usn.IndexOf(':');
            if(i1 < 0) return usn;
            var i2 = usn.IndexOf(':', ++i1);
            if(i2 < 0) return usn[i1..];
            return usn[i1..i2];
        }

        private void Notify(UpnpDiscoveryEvent discoveryEvent)
        {
            foreach(var observer in observers)
            {
                try
                {
                    observer.OnNext(discoveryEvent);
                }
                catch(Exception exception)
                {
                    logger.LogError(exception, $"Error providing new data to the observer: {observer}");
                }
            }
        }

        private void NotifyCompletion()
        {
            foreach(var observer in observers)
            {
                try
                {
                    observer.OnCompleted();
                }
                catch(Exception exception)
                {
                    logger.LogError(exception, $"Error sending completion notification to the observer: {observer}");
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