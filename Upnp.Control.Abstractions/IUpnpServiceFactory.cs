namespace Upnp.Control.Abstractions;

public interface IUpnpServiceFactory
{
    Task<(TService, DeviceDescription)> GetAsync<TService>(string deviceId, CancellationToken cancellationToken)
        where TService : SoapActionInvoker, IUpnpService;
    Task<TService> GetServiceAsync<TService>(string deviceId, CancellationToken cancellationToken)
        where TService : SoapActionInvoker, IUpnpService;
    Task<(TService1, TService2)> GetServicesAsync<TService1, TService2>(string deviceId, CancellationToken cancellationToken)
        where TService1 : SoapActionInvoker, IUpnpService
        where TService2 : SoapActionInvoker, IUpnpService;
}