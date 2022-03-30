using System.Globalization;
using IoT.Device.Upnp.Umi.Services;
using Upnp.Control.Infrastructure.UpnpEvents.Configuration;

namespace Upnp.Control.Infrastructure.UpnpEvents;

#pragma warning disable CA1812 // instantiated by DI container
internal sealed partial class UpnpEventSubscriptionService : IObserver<UpnpDiscoveryEvent>, IAsyncDisposable
{
    private readonly IUpnpEventSubscriptionFactory factory;
    private readonly ILogger<UpnpEventSubscriptionService> logger;
    private readonly IOptionsMonitor<UpnpEventsOptions> optionsMonitor;
    private readonly IUpnpEventSubscriptionRepository repository;

    public UpnpEventSubscriptionService(IUpnpEventSubscriptionRepository repository, IUpnpEventSubscriptionFactory factory,
        IOptionsMonitor<UpnpEventsOptions> optionsMonitor, ILogger<UpnpEventSubscriptionService> logger)
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
            var options = optionsMonitor.CurrentValue;
            var sessionTimeout = options.SessionTimeout;

            foreach (var (serviceType, template) in options.CallbackMappings)
            {
                var service = services.Single(s => s.ServiceType == serviceType);
                repository.Add(deviceId, factory.Subscribe(service.EventsUrl, new Uri(string.Format(CultureInfo.InvariantCulture, template, deviceId), UriKind.Relative), sessionTimeout));
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
        var sessions = repository.GetById(deviceId).ToList();

        if (!sessions.Any() || sessions.Any(s => s.IsCompleted))
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
#pragma warning disable CA1031 // By design
            catch (Exception exception)
#pragma warning restore CA1031
            {
                LogTerminationError(exception);
            }
        }
    }

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

    [LoggerMessage(1, LogLevel.Error, "Error subscribing to UPnP events for device {deviceId}")]
    private partial void LogError(Exception exception, string deviceId);

    [LoggerMessage(2, LogLevel.Error, "Error terminating maintenance worker for UPnP event subscription")]
    private partial void LogTerminationError(Exception exception);
}