using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Soap;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IUpnpServiceFactory
    {
        Task<TService> GetServiceAsync<TService>(string deviceId, CancellationToken cancellationToken)
            where TService : SoapActionInvoker;
        Task<(TService1, TService2)> GetServiceAsync<TService1, TService2>(string deviceId, CancellationToken cancellationToken)
            where TService1 : SoapActionInvoker
            where TService2 : SoapActionInvoker;
        Task<(TService1, TService2, TService3)> GetServiceAsync<TService1, TService2, TService3>(string deviceId, CancellationToken cancellationToken)
            where TService1 : SoapActionInvoker
            where TService2 : SoapActionInvoker
            where TService3 : SoapActionInvoker;
    }
}