namespace Upnp.Control.Infrastructure.SignalR;

public class UpnpEventsHub : Hub<IUpnpEventClient>
{
    public Task SendAVTransportEventAsync(string deviceId, AVStateMessage message) => Clients.All.AVTransportEvent(deviceId, message);

    public Task SendRenderingControlEventAsync(string deviceId, RCStateMessage message) => Clients.All.RenderingControlEvent(deviceId, message);

    public Task SendSsdpDiscoveryEventAsync(string deviceId, UpnpDiscoveryMessage message) => Clients.All.SsdpDiscoveryEvent(deviceId, message);
}