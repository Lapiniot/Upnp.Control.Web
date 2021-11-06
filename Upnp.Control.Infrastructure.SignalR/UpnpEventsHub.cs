using Upnp.Control.Models;

namespace Upnp.Control.Infrastructure.SignalR;

public class UpnpEventsHub : Hub<IUpnpEventClient>
{
    public Task SendAVTransportEventAsync(string deviceId, AVStateMessage message)
    {
        return Clients.All.AVTransportEvent(deviceId, message);
    }

    public Task SendRenderingControlEventAsync(string deviceId, RCStateMessage message)
    {
        return Clients.All.RenderingControlEvent(deviceId, message);
    }

    public Task SendSsdpDiscoveryEventAsync(string deviceId, UpnpDiscoveryMessage message)
    {
        return Clients.All.SsdpDiscoveryEvent(deviceId, message);
    }
}