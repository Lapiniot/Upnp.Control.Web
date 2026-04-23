namespace Upnp.Control.Infrastructure.UpnpEvents;

internal sealed class RCPropChangedEventCommandHandler(IEnumerable<IObserver<RCPropChangedEvent>> eventObservers,
    IQueryHandler<GetDeviceDescriptionQuery, DeviceDescription> handler,
    ILogger<RCPropChangedEventCommandHandler> logger) :
    PropChangedUpnpEventCommandHandler<RCPropChangedCommand, RCPropChangedEvent>(eventObservers, handler, logger)
{ }