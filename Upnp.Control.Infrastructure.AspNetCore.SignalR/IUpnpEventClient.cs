namespace Upnp.Control.Infrastructure.AspNetCore.SignalR;

public interface IUpnpEventClient
{
    Task AVTransportEvent(string device, AVStateMessage message);
    Task RenderingControlEvent(string device, RCStateMessage message);
    Task SsdpDiscoveryEvent(string device, UpnpDiscoveryMessage message);
}