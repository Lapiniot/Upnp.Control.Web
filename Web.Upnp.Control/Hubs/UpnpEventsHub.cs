using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Web.Upnp.Control.Hubs
{
    public class UpnpEventsHub : Hub<IUpnpEventClient>
    {
        public Task UpnpEventAsync(string deviceId, string service, object message)
        {
            return Clients.All.UpnpEvent(deviceId, service, message);
        }

        public Task SendAVTransportEventAsync(string deviceId, object message)
        {
            return Clients.All.AVTransportEvent(deviceId, message);
        }

        public Task SendRenderingControlEventAsync(string deviceId, object message)
        {
            return Clients.All.RenderingControlEvent(deviceId, message);
        }
    }
}