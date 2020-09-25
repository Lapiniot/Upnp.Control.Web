using System.Threading.Tasks;
using IoT.Protocol.Soap;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IUpnpServiceFactory
    {
        Task<TService> GetServiceAsync<TService>(string deviceId, string schema = null) where TService : SoapActionInvoker;
    }
}