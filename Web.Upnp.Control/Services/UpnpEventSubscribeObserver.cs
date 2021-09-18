using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Models.Events;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services;

public sealed class UpnpEventSubscribeObserver : IObserver<UpnpDiscoveryEvent>, IAsyncDisposable
{
    private readonly IUpnpEventSubscriptionFactory factory;
    private readonly ILogger<UpnpEventSubscribeObserver> logger;
    private readonly IOptionsMonitor<UpnpEventOptions> optionsMonitor;
    private readonly IUpnpSubscriptionsRepository repository;

    public UpnpEventSubscribeObserver(IUpnpSubscriptionsRepository repository, IUpnpEventSubscriptionFactory factory,
        IOptionsMonitor<UpnpEventOptions> optionsMonitor, ILogger<UpnpEventSubscribeObserver> logger)
    {
        ArgumentNullException.ThrowIfNull(repository);
        ArgumentNullException.ThrowIfNull(factory);
        ArgumentNullException.ThrowIfNull(optionsMonitor);
        ArgumentNullException.ThrowIfNull(logger);

        this.repository = repository;
        this.factory = factory;
        this.optionsMonitor = optionsMonitor;
        this.logger = logger;
    }

    #region Implementation of IAsyncDisposable

    public async ValueTask DisposeAsync()
    {
        await TerminateAsync(repository.GetAll()).ConfigureAwait(false);
        repository.Clear();
    }

    #endregion

    private void SubscribeToEvents(string deviceId, IEnumerable<Service> services)
    {
        try
        {
            var baseUrl = $"api/events/{Uri.EscapeDataString(deviceId)}/notify";

            var rcService = services.Single(s => s.ServiceType == UpnpServices.RenderingControl);
            var avtService = services.Single(s => s.ServiceType == UpnpServices.AVTransport);

            var sessionTimeout = optionsMonitor.CurrentValue.SessionTimeout;

            repository.Add(deviceId,
                factory.Subscribe(rcService.EventsUrl, new Uri(baseUrl + "/rc", UriKind.Relative), sessionTimeout),
                factory.Subscribe(avtService.EventsUrl, new Uri(baseUrl + "/avt", UriKind.Relative), sessionTimeout)
            );
        }
        catch(Exception exception)
        {
            logger.LogError(exception, "Error subscribing to UPnP events for device {deviceId}", deviceId);
            throw;
        }
    }

    private async Task RenewSubscriptionsAsync(string deviceId, IEnumerable<Service> services)
    {
        var sessions = repository.GetById(deviceId).ToList();

        if(!sessions.Any() || sessions.Any(s => s.IsCompleted))
        {
            await TerminateAsync(sessions).ConfigureAwait(false);
            SubscribeToEvents(deviceId, services);
        }
    }

    private async Task TerminateAsync(IEnumerable<IAsyncDisposable> subscriptions)
    {
        foreach(var subscription in subscriptions)
        {
            try
            {
                await subscription.DisposeAsync().ConfigureAwait(false);
            }
            catch(Exception exception)
            {
                logger.LogError(exception, "Error terminating maintenance worker for UPnP event subscription");
            }
        }
    }

    #region Implementation of IObserver<UpnpDiscoveryEvent>

    public void OnCompleted() { }

    public void OnError(Exception error) { }

    public void OnNext(UpnpDiscoveryEvent value)
    {
        switch(value)
        {
            case UpnpDeviceAppearedEvent dae when IsRenderer(dae.Device):
                SubscribeToEvents(dae.DeviceId, dae.Device.Services);
                break;
            case UpnpDeviceUpdatedEvent due when IsRenderer(due.Device):
                _ = RenewSubscriptionsAsync(due.DeviceId, due.Device.Services);
                break;
            case UpnpDeviceDisappearedEvent dde:
                _ = repository.Remove(dde.DeviceId, out var subscriptions);
                _ = TerminateAsync(subscriptions);
                break;
        }
    }

    private static bool IsRenderer(UpnpDevice device)
    {
        return device.DeviceType == UpnpServices.MediaRenderer ||
            device.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema);
    }

    #endregion
}