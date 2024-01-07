using IoT.Device.Upnp.Umi.Services;
using Upnp.Control.Infrastructure.UpnpEvents.Configuration;
using static System.Globalization.CultureInfo;

namespace Upnp.Control.Infrastructure.UpnpEvents;

internal sealed partial class UpnpEventSubscriptionService : IObserver<UpnpDiscoveryEvent>, IAsyncDisposable
{
    private readonly IUpnpEventSubscriptionFactory factory;
    private readonly ILogger<UpnpEventSubscriptionService> logger;
    private readonly IOptionsMonitor<UpnpEventsOptions> optionsMonitor;
    private readonly IEventSubscriptionStore store;

    public UpnpEventSubscriptionService(IEventSubscriptionStore store, IUpnpEventSubscriptionFactory factory,
        IOptionsMonitor<UpnpEventsOptions> optionsMonitor, ILogger<UpnpEventSubscriptionService> logger)
    {
        ArgumentNullException.ThrowIfNull(store);
        ArgumentNullException.ThrowIfNull(factory);
        ArgumentNullException.ThrowIfNull(optionsMonitor);
        ArgumentNullException.ThrowIfNull(logger);

        this.store = store;
        this.factory = factory;
        this.optionsMonitor = optionsMonitor;
        this.logger = logger;
    }

    private void SubscribeToEvents(string deviceId, IEnumerable<Service> services)
    {
        try
        {
            var options = optionsMonitor.CurrentValue;
            var sessionTimeout = options.SessionTimeout;
            var mappings = options.CallbackMappings;

            foreach (var (_, serviceType, _, _, eventsUrl) in services)
            {
                if (mappings.TryGetValue(serviceType, out var template))
                {
                    store.Add(deviceId, factory.Subscribe(eventsUrl, new(string.Format(InvariantCulture, template, deviceId), UriKind.Relative), sessionTimeout));
                }
            }
        }
        catch (Exception exception)
        {
            LogError(exception, deviceId);
            throw;
        }
    }

    private async Task RenewSubscriptionsAsync(string deviceId, IEnumerable<Service> services)
    {
        var sessions = store.GetById(deviceId).ToList();

        if (sessions.Count is 0 || sessions.Any(s => s.IsCompleted))
        {
            await TerminateAsync(sessions).ConfigureAwait(false);
            SubscribeToEvents(deviceId, services);
        }
    }

    private async Task TerminateAsync(IEnumerable<IAsyncDisposable> subscriptions)
    {
        foreach (var subscription in subscriptions)
        {
            try
            {
                await subscription.DisposeAsync().ConfigureAwait(false);
            }
#pragma warning disable CA1031 // Do not catch general exception types
            catch (Exception exception)
#pragma warning restore CA1031 // Do not catch general exception types
            {
                LogTerminationError(exception);
            }
        }
    }

    [LoggerMessage(1, LogLevel.Error, "Error subscribing to UPnP events for device {deviceId}")]
    private partial void LogError(Exception exception, string deviceId);

    [LoggerMessage(2, LogLevel.Error, "Error terminating maintenance worker for UPnP event subscription")]
    private partial void LogTerminationError(Exception exception);

    #region Implementation of IAsyncDisposable

    public async ValueTask DisposeAsync()
    {
        await TerminateAsync(store.GetAll()).ConfigureAwait(false);
        store.Clear();
    }

    #endregion

    #region Implementation of IObserver<UpnpDiscoveryEvent>

    public void OnCompleted() { }

    public void OnError(Exception error) { }

    public void OnNext(UpnpDiscoveryEvent value)
    {
        switch (value)
        {
            case UpnpDeviceAppearedEvent dae when IsRenderer(dae.Device):
                SubscribeToEvents(dae.DeviceId, dae.Device.Services);
                break;
            case UpnpDeviceUpdatedEvent due when IsRenderer(due.Device):
                RenewSubscriptionsAsync(due.DeviceId, due.Device.Services).Observe();
                break;
            case UpnpDeviceDisappearedEvent dde:
                store.Remove(dde.DeviceId, out var subscriptions);
                TerminateAsync(subscriptions).Observe();
                break;
        }
    }

    private static bool IsRenderer(UpnpDevice device) =>
        device.DeviceType == UpnpServices.MediaRenderer ||
        device.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema);

    #endregion
}