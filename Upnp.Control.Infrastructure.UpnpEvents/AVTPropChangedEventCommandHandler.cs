namespace Upnp.Control.Infrastructure.UpnpEvents;

internal sealed class AVTPropChangedEventCommandHandler(IEnumerable<IObserver<AVTPropChangedEvent>> eventObservers,
    IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler, ILogger<AVTPropChangedEventCommandHandler> logger) : PropChangedUpnpEventCommandHandler<AVTPropChangedCommand, AVTPropChangedEvent>(eventObservers, handler, logger)
{

    protected override ValueTask NotifyObserversAsync(IEnumerable<IObserver<AVTPropChangedEvent>> observers,
        string deviceId, IReadOnlyDictionary<string, string> properties,
        IReadOnlyDictionary<string, string> vendorProperties, CancellationToken cancellationToken)
    {
        if (properties.Count == 1 &&
            (properties.ContainsKey("RelativeTimePosition") ||
             properties.ContainsKey("AbsoluteTimePosition")))
        {
            // Workaround for some quirky renderers that report position changes every second during playback
            // via state variable changes. Some way of throttling is definitely needed here :(
            return ValueTask.CompletedTask;
        }

        return base.NotifyObserversAsync(observers, deviceId, properties, vendorProperties, cancellationToken);
    }
}