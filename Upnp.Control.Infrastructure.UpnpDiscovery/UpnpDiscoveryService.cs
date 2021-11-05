using System.Diagnostics.CodeAnalysis;
using IoT.Protocol.Upnp;
using Upnp.Control.Models;
using Upnp.Control.Models.Events;
using Upnp.Control.Services;

using static System.StringComparison;

using Icon = Upnp.Control.Models.Icon;

namespace Upnp.Control.Infrastructure.UpnpDiscovery;

[SuppressMessage("Performance", "CA1812: Avoid uninstantiated internal classes", Justification = "Instantiated by DI container")]
internal partial class UpnpDiscoveryService : BackgroundService
{
    private const string RootDevice = "upnp:rootdevice";
    private readonly IUpnpServiceMetadataProvider metadataProvider;
    private readonly IServiceProvider services;

    public UpnpDiscoveryService(IServiceProvider services, ILogger<UpnpDiscoveryService> logger, IUpnpServiceMetadataProvider metadataProvider)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(logger);
        ArgumentNullException.ThrowIfNull(metadataProvider);

        this.services = services;
        this.logger = logger;
        this.metadataProvider = metadataProvider;
    }

    [SuppressMessage("Design", "CA1031: Do not catch general exception types", Justification = "By design")]
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        LogStarted();

        try
        {
            using var scope = services.CreateScope();
            var repository = scope.ServiceProvider.GetRequiredService<IUpnpDeviceRepository>();
            var enumerator = scope.ServiceProvider.GetRequiredService<IAsyncEnumerable<SsdpReply>>();
            var observers = scope.ServiceProvider.GetServices<IObserver<UpnpDiscoveryEvent>>().ToArray();

            try
            {
                await foreach(var reply in enumerator.WithCancellation(stoppingToken).ConfigureAwait(false))
                {
                    try
                    {
                        TraceReply(reply);

                        if(reply.StartLine.StartsWith("M-SEARCH", InvariantCulture)) continue;

                        var udn = ExtractUdn(reply.UniqueServiceName);

                        if(reply.StartLine.StartsWith("NOTIFY", InvariantCulture) && reply.TryGetValue("NT", out var nt))
                        {
                            if(nt != RootDevice) continue;

                            if(reply.TryGetValue("NTS", out var nts) && nts == "ssdp:byebye")
                            {
                                if(await repository.TryRemoveAsync(udn, stoppingToken).ConfigureAwait(false) is { } removed)
                                {
                                    Notify(observers, new UpnpDeviceDisappearedEvent(udn, removed));
                                }

                                continue;
                            }
                        }
                        else if(reply.TryGetValue("ST", out var st) && st != RootDevice)
                        {
                            continue;
                        }

                        var device = await repository.FindAsync(udn, stoppingToken).ConfigureAwait(false);

                        if(device != null)
                        {
                            await repository.PatchAsync(device, d => d.ExpiresAt, DateTime.UtcNow.AddSeconds(reply.MaxAge + 10), stoppingToken).ConfigureAwait(false);

                            Notify(observers, new UpnpDeviceUpdatedEvent(udn, device));

                            LogExpirationUpdated(udn);

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

                        await repository.AddAsync(device, stoppingToken).ConfigureAwait(false);

                        LogDeviceDiscovered(desc.Udn);

                        Notify(observers, new UpnpDeviceAppearedEvent(udn, device));
                    }
                    catch(Exception exception)
                    {
                        LogReplyError(exception, reply.StartLine, reply.UniqueServiceName);
                    }
                }
            }
            catch(OperationCanceledException) { /* Expected */}
            finally
            {
                NotifyCompletion(observers);
            }
        }
        catch(Exception exception)
        {
            LogError(exception);
            throw;
        }
    }

    private static string ExtractUdn(string usn)
    {
        var i1 = usn.IndexOf(':', InvariantCulture);
        if(i1 < 0) return usn;
        var i2 = usn.IndexOf(':', ++i1);
        return i2 < 0 ? usn[i1..] : usn[i1..i2];
    }

    [SuppressMessage("Design", "CA1031: Do not catch general exception types", Justification = "By design")]
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
                LogNotifyError(exception, observer);
            }
        }
    }

    [SuppressMessage("Design", "CA1031: Do not catch general exception types", Justification = "By design")]
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
                LogNotifyCompleteError(exception, observer);
            }
        }
    }
}