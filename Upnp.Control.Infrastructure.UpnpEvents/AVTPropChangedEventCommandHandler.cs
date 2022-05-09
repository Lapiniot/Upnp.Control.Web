namespace Upnp.Control.Infrastructure.UpnpEvents;

#pragma warning disable CA1812 // instantiated by DI container
internal sealed class AVTPropChangedEventCommandHandler : PropChangedUpnpEventCommandHandler<AVTPropChangedEvent>
{
    public AVTPropChangedEventCommandHandler(IEnumerable<IObserver<UpnpEvent>> observers,
        IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler,
        ILogger<PropChangedUpnpEventCommandHandler<AVTPropChangedEvent>> logger) :
        base(observers, handler, logger)
    {
    }

    protected override ValueTask NotifyObserversAsync(IEnumerable<IObserver<UpnpEvent>> observers, string deviceId, IReadOnlyDictionary<string, string> properties, IReadOnlyDictionary<string, string> vendorProperties, CancellationToken cancellationToken)
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