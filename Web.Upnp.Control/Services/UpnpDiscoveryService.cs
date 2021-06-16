using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Models.Events;
using Web.Upnp.Control.Services.Abstractions;
using Icon = Web.Upnp.Control.Models.Icon;
using static System.StringComparison;
using System;

namespace Web.Upnp.Control.Services
{
    public class UpnpDiscoveryService : BackgroundService
    {
        private const string RootDevice = "upnp:rootdevice";
        private readonly ILogger<UpnpDiscoveryService> logger;
        private readonly IUpnpServiceMetadataProvider metadataProvider;
        private readonly IServiceProvider services;

        public UpnpDiscoveryService(IServiceProvider services, ILogger<UpnpDiscoveryService> logger, IUpnpServiceMetadataProvider metadataProvider)
        {
            this.services = services ?? throw new ArgumentNullException(nameof(services));
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.metadataProvider = metadataProvider ?? throw new ArgumentNullException(nameof(metadataProvider));
        }

        [SuppressMessage("Microsoft.Design", "CA1031: Do not catch general exception types", Justification = "By design")]
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("Started UPnP device discovery service...");

            try
            {
                using var scope = services.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<UpnpDbContext>();

                await using(context.ConfigureAwait(false))
                {
                    var enumerator = scope.ServiceProvider.GetRequiredService<IAsyncEnumerable<SsdpReply>>();
                    var observers = scope.ServiceProvider.GetServices<IObserver<UpnpDiscoveryEvent>>().ToArray();

                    try
                    {
                        await foreach(var reply in enumerator.WithCancellation(stoppingToken).ConfigureAwait(false))
                        {
                            try
                            {
                                if(logger.IsEnabled(LogLevel.Trace)) DebugDump(reply, LogLevel.Trace);

                                if(reply.StartLine.StartsWith("M-SEARCH", InvariantCulture)) continue;

                                var udn = ExtractUdn(reply.UniqueServiceName);

                                if(reply.StartLine.StartsWith("NOTIFY", InvariantCulture) && reply.TryGetValue("NT", out var nt))
                                {
                                    if(nt != RootDevice) continue;

                                    if(reply.TryGetValue("NTS", out var nts) && nts == "ssdp:byebye")
                                    {
                                        var existing = await context.FindAsync<UpnpDevice>(new object[] { udn }, stoppingToken).ConfigureAwait(false);
                                        if(existing != null)
                                        {
                                            context.Remove(existing);
                                            await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
                                            Notify(observers, new UpnpDeviceDisappearedEvent(udn, existing));
                                        }

                                        continue;
                                    }
                                }
                                else if(reply.TryGetValue("ST", out var st) && st != RootDevice)
                                {
                                    continue;
                                }

                                var device = await context.FindAsync<UpnpDevice>(new object[] { udn }, stoppingToken).ConfigureAwait(false);

                                if(device != null)
                                {
                                    context.Entry(device).Property(d => d.ExpiresAt).CurrentValue = DateTime.UtcNow.AddSeconds(reply.MaxAge + 10);
                                    await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);

                                    Notify(observers, new UpnpDeviceUpdatedEvent(udn, device));

                                    logger.LogInformation($"Device expiration updated for UDN='{udn}'");

                                    continue;
                                }

                                var desc = await metadataProvider.GetDescriptionAsync(new Uri(reply.Location), stoppingToken).ConfigureAwait(false);

                                device = new UpnpDevice(udn, desc.Location, desc.DeviceType, desc.FriendlyName, desc.Manufacturer,
                                    desc.ModelDescription, desc.ModelName, desc.ModelNumber, DateTime.UtcNow.AddSeconds(reply.MaxAge + 10),
                                    desc.ManufacturerUri, desc.ModelUri, desc.PresentationUri)
                                {
                                    BootId = reply.BootId,
                                    ConfigId = reply.ConfigId,
                                    Icons = desc.Icons.Select(i => new Icon(i.Width, i.Height, i.Uri, i.Mime)).ToList(),
                                    Services = desc.Services.Select(s => new Service(s.ServiceId, s.ServiceType, s.MetadataUri, s.ControlUri, s.EventSubscribeUri)).ToList()
                                };

                                await context.AddAsync(device, stoppingToken).ConfigureAwait(false);
                                await context.SaveChangesAsync(stoppingToken).ConfigureAwait(false);

                                logger.LogInformation($"New device discovered with UDN='{desc.Udn}'");

                                Notify(observers, new UpnpDeviceAppearedEvent(udn, device));
                            }
                            catch(Exception exception)
                            {
                                logger.LogError(exception, $"Error processing SSDP reply {reply.StartLine} for USN={reply.UniqueServiceName}");
                            }
                        }
                    }
                    catch(OperationCanceledException) { /* Expected */}
                    finally
                    {
                        NotifyCompletion(observers);
                    }
                }
            }
            catch(Exception ex)
            {
                logger.LogError(ex, "Error discovering UPnP devices and services!");
                throw;
            }
        }

        private void DebugDump(SsdpReply reply, LogLevel logLevel)
        {
            var sb = new StringBuilder();
            sb.AppendLine();
            sb.AppendLine($"***** {reply.StartLine} *****");
            foreach(var (key, value) in reply)
            {
                sb.AppendLine($"{key}: {value}");
            }

            logger.Log(logLevel, sb.ToString());
        }

        private static string ExtractUdn(string usn)
        {
            var i1 = usn.IndexOf(':', InvariantCulture);
            if(i1 < 0) return usn;
            var i2 = usn.IndexOf(':', ++i1);
            return i2 < 0 ? usn[i1..] : usn[i1..i2];
        }

        [SuppressMessage("Microsoft.Design", "CA1031: Do not catch general exception types", Justification = "By design")]
        private void Notify(IEnumerable<IObserver<UpnpDiscoveryEvent>> observers, UpnpDiscoveryEvent discoveryEvent)
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

        [SuppressMessage("Microsoft.Design", "CA1031: Do not catch general exception types", Justification = "By design")]
        private void NotifyCompletion(IEnumerable<IObserver<UpnpDiscoveryEvent>> observers)
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
    }
}