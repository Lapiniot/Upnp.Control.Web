namespace Upnp.Control.Abstractions;

public interface IUpnpServiceFactory
{
    Task<TService> GetServiceAsync<TService>(string deviceId, CancellationToken cancellationToken)
        where TService : SoapActionInvoker, IUpnpService, IUpnpServiceFactory<TService>;
    Task<(TService1, TService2)> GetServicesAsync<TService1, TService2>(string deviceId, CancellationToken cancellationToken)
        where TService1 : SoapActionInvoker, IUpnpService, IUpnpServiceFactory<TService1>
        where TService2 : SoapActionInvoker, IUpnpService, IUpnpServiceFactory<TService2>;
}