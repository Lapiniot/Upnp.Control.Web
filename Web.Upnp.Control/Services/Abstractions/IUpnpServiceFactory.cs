using IoT.Protocol.Soap;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IUpnpServiceFactory
    {
        Task<(TService, DeviceDescription)> GetAsync<TService>(string deviceId, CancellationToken cancellationToken)
            where TService : SoapActionInvoker;
        Task<TService> GetServiceAsync<TService>(string deviceId, CancellationToken cancellationToken)
            where TService : SoapActionInvoker;
        Task<(TService1, TService2)> GetServicesAsync<TService1, TService2>(string deviceId, CancellationToken cancellationToken)
            where TService1 : SoapActionInvoker
            where TService2 : SoapActionInvoker;
        Task<(TService1, TService2, TService3)> GetServicesAsync<TService1, TService2, TService3>(string deviceId, CancellationToken cancellationToken)
            where TService1 : SoapActionInvoker
            where TService2 : SoapActionInvoker
            where TService3 : SoapActionInvoker;
    }
}