namespace Upnp.Control.Infrastructure.UpnpEvents;

internal sealed class RCPropChangedEventCommandHandler : PropChangedUpnpEventCommandHandler<RCPropChangedCommand, RCPropChangedEvent>
{
    public RCPropChangedEventCommandHandler(IEnumerable<IObserver<RCPropChangedEvent>> eventObservers,
        IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler, ILogger<RCPropChangedEventCommandHandler> logger) :
        base(eventObservers, handler, logger)
    { }
}