using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;

namespace Web.Upnp.Control.Hubs
{
    public interface IUpnpEventClient
    {
        Task UpnpEvent(string device, string service, object message);
        Task AVTransportEvent(string device, object message);
        Task RenderingControlEvent(string device, object message);
        Task SsdpDiscoveryEvent(string device, object message);
    }
}