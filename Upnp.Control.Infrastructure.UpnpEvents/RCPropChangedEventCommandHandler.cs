namespace Upnp.Control.Infrastructure.UpnpEvents;

internal sealed class RCPropChangedEventCommandHandler(IEnumerable<IObserver<RCPropChangedEvent>> eventObservers,
    IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler, ILogger<RCPropChangedEventCommandHandler> logger) : PropChangedUpnpEventCommandHandler<RCPropChangedCommand, RCPropChangedEvent>(eventObservers, handler, logger)
{ }