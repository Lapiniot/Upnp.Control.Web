using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.Hubs
{
    public interface IUpnpEventClient
    {
        Task AVTransportEvent(string device, object message);
        Task RenderingControlEvent(string device, object message);
        Task SsdpDiscoveryEvent(string device, UpnpDiscoveryMessage message);
    }
}