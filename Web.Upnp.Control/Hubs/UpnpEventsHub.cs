using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Web.Upnp.Control.Hubs
{
    public class UpnpEventsHub : Hub<IUpnpEventClient>
    {
        public UpnpEventsHub()
        {
        }

        public Task SendAsync(string deviceId, string message)
        {
            return Clients.All.UpnpEvent(deviceId, message);
        }
    }
}