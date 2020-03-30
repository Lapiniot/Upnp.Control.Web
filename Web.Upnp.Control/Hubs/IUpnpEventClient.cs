using System.Threading.Tasks;

namespace Web.Upnp.Control.Hubs
{
    public interface IUpnpEventClient
    {
        Task UpnpEvent(string device, string message);
    }
}