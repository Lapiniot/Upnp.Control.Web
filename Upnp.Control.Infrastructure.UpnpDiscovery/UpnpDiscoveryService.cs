using System.Diagnostics.CodeAnalysis;
using IoT.Protocol.Upnp;
using Upnp.Control.Abstractions;
using static System.StringComparison;

namespace Upnp.Control.Infrastructure.UpnpDiscovery;

internal sealed partial class UpnpDiscoveryService(
    IServiceProvider services, IUpnpServiceMetadataProvider metadataProvider, ILogger<UpnpDiscoveryService> logger) :
    BackgroundServiceBase(logger), IHostedLifecycleService
{
    private const string RootDevice = "upnp:rootdevice";
    private readonly TaskCompletionSource startedTcs = new();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await startedTcs.Task.WaitAsync(stoppingToken).ConfigureAwait(false);

        LogStarted();

        try
        {
            using var serviceScope = services.CreateScope();
            var serviceProvider = serviceScope.ServiceProvider;
            var enumerator = serviceProvider.GetRequiredService<IAsyncEnumerable<SsdpReply>>();
            var observers = serviceProvider.GetServices<IObserver<UpnpDiscoveryEvent>>().ToArray();

            try
            {
                await foreach (var reply in enumerator.WithCancellation(stoppingToken).ConfigureAwait(false))
                {
                    try
                    {
                        TraceReply(reply);
                        var udn = ExtractUdn(reply.UniqueServiceName);

                        using var scope = serviceProvider.CreateScope();
                        var getQueryHandler = scope.ServiceProvider.GetRequiredService<IAsyncQueryHandler<GetDeviceQuery, UpnpDevice>>();

                        if (reply.StartLine.StartsWith("NOTIFY", InvariantCulture) && reply.TryGetValue("NT", out var nt))
                        {
                            if (nt != RootDevice) continue;

                            if (reply.TryGetValue("NTS", out var nts) && nts == "ssdp:byebye")
                            {
                                if (await getQueryHandler.ExecuteAsync(new(udn), stoppingToken).ConfigureAwait(false) is { } existing)
                                {
                                    var rmHandler = scope.ServiceProvider.GetRequiredService<IAsyncCommandHandler<RemoveDeviceCommand>>();
                                    await rmHandler.ExecuteAsync(new(udn), stoppingToken).ConfigureAwait(false);

                                    Notify(observers, new UpnpDeviceDisappearedEvent(udn, existing));
                                    LogDeviceDisappeared(udn);
                                }

                                continue;
                            }
                        }
                        else if (reply.TryGetValue("ST", out var st) && st != RootDevice)
                        {
                            continue;
                        }

                        var device = await getQueryHandler.ExecuteAsync(new(udn), stoppingToken).ConfigureAwait(false);

                        if (device != null)
                        {
                            var updateHandler = scope.ServiceProvider.GetRequiredService<IAsyncCommandHandler<UpdateDeviceExpirationCommand>>();
                            await updateHandler.ExecuteAsync(new(udn, DateTime.UtcNow.AddSeconds(reply.MaxAge + 10)), stoppingToken).ConfigureAwait(false);

                            Notify(observers, new UpnpDeviceUpdatedEvent(udn, device));
                            LogExpirationUpdated(udn);

                            continue;
                        }

                        var location = new Uri(reply.Location);
                        var desc = await metadataProvider.GetDescriptionAsync(location, stoppingToken).ConfigureAwait(false);

                        device = new(udn, location, desc.DeviceType, desc.FriendlyName, desc.Manufacturer,
                            desc.ModelDescription, desc.ModelName, desc.ModelNumber, DateTime.UtcNow.AddSeconds(reply.MaxAge + 10),
                            GetAbsoluteUri(desc.ManufacturerUrl, location),
                            GetAbsoluteUri(desc.ModelUrl, location),
                            GetAbsoluteUri(desc.PresentationUrl, location))
                        {
                            BootId = reply.BootId,
                            ConfigId = reply.ConfigId,
                            Icons = desc.Icons?.Select(i => new Icon(i.Width, i.Height, GetAbsoluteUri(i.Uri, location), i.Mime)).ToList(),
                            Services = desc.Services?.Select(s => new Service(s.ServiceId, s.ServiceType,
                                GetAbsoluteUri(s.MetadataUrl, location),
                                GetAbsoluteUri(s.ControlUrl, location),
                                GetAbsoluteUri(s.EventSubscribeUrl, location))).ToList()
                        };

                        var addHandler = scope.ServiceProvider.GetRequiredService<IAsyncCommandHandler<AddDeviceCommand>>();
                        await addHandler.ExecuteAsync(new(device), stoppingToken).ConfigureAwait(false);

                        LogDeviceDiscovered(desc.Udn);

                        Notify(observers, new UpnpDeviceAppearedEvent(udn, device));
                    }
#pragma warning disable CA1031 // Do not catch general exception types
                    catch (Exception exception)
#pragma warning restore CA1031 // Do not catch general exception types
                    {
                        LogReplyError(exception, reply.StartLine, reply.UniqueServiceName);
                    }
                }
            }
            catch (OperationCanceledException)
            {
                /* Expected */
            }
            finally
            {
                NotifyCompletion(observers);
            }
        }
        catch (Exception exception)
        {
            LogError(exception);
            throw;
        }
    }

    private static Uri GetAbsoluteUri(Uri uri, Uri baseUri) =>
        uri is { IsAbsoluteUri: false }
            ? Uri.TryCreate(baseUri, uri, out var absoluteUri) ? absoluteUri : uri
            : uri;

    private static string ExtractUdn(string usn)
    {
        var i1 = usn.IndexOf(':', InvariantCulture);
        if (i1 < 0) return usn;
        var i2 = usn.IndexOf(':', ++i1);
        return i2 < 0 ? usn[i1..] : usn[i1..i2];
    }

    [SuppressMessage("Design", "CA1031: Do not catch general exception types", Justification = "By design")]
    private void Notify(IEnumerable<IObserver<UpnpDiscoveryEvent>> observers, UpnpDiscoveryEvent discoveryEvent)
    {
        foreach (var observer in observers)
        {
            try
            {
                observer.OnNext(discoveryEvent);
            }
            catch (Exception exception)
            {
                LogNotifyError(exception, observer);
            }
        }
    }

    [SuppressMessage("Design", "CA1031: Do not catch general exception types", Justification = "By design")]
    private void NotifyCompletion(IEnumerable<IObserver<UpnpDiscoveryEvent>> observers)
    {
        foreach (var observer in observers)
        {
            try
            {
                observer.OnCompleted();
            }
            catch (Exception exception)
            {
                LogNotifyCompleteError(exception, observer);
            }
        }
    }

    public Task StartingAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    public Task StartedAsync(CancellationToken cancellationToken)
    {
        startedTcs.SetResult();
        return Task.CompletedTask;
    }

    public Task StoppingAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    public Task StoppedAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}