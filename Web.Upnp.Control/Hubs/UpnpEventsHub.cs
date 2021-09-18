using Microsoft.AspNetCore.SignalR;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.Hubs
{
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
}