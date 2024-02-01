using IoT.Protocol.Upnp;
using UpnpDevice = Upnp.Control.Models.UpnpDevice;
using static System.Globalization.CultureInfo;

namespace Upnp.Control.Infrastructure.Upnp;

public class UpnpServiceFactory(IHttpClientFactory clientFactory, IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> queryHandler) : IUpnpServiceFactory
{
    private static readonly Dictionary<string, string> UmiMappings = new()
    {
        {"urn:schemas-upnp-org:service:ContentDirectory:1", "/{0}-MS/upnp.org-ContentDirectory-1/control"},
        {"urn:schemas-upnp-org:service:AVTransport:1", "/{0}-MR/upnp.org-AVTransport-1/control"},
        {"urn:xiaomi-com:service:SystemProperties:1", "/{0}/xiaomi.com-SystemProperties-1/control"},
        {"urn:schemas-upnp-org:service:ConnectionManager:1", "/{0}-MR/upnp.org-ConnectionManager-1/control"},
        {"urn:schemas-upnp-org:service:RenderingControl:1", "/{0}-MR/upnp.org-RenderingControl-1/control"}
    };

    public async Task<TService> GetServiceAsync<TService>(string deviceId, CancellationToken cancellationToken)
        where TService : SoapActionInvoker, IUpnpService, IUpnpServiceFactory<TService>
    {
        var device = await queryHandler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);
        return GetService<TService>(controlUrl: GetControlUrl<TService>(device));
    }

    public async Task<(TService1, TService2)> GetServicesAsync<TService1, TService2>(string deviceId, CancellationToken cancellationToken)
        where TService1 : SoapActionInvoker, IUpnpService, IUpnpServiceFactory<TService1>
        where TService2 : SoapActionInvoker, IUpnpService, IUpnpServiceFactory<TService2>
    {
        var device = await queryHandler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);
        return (GetService<TService1>(GetControlUrl<TService1>(device)), GetService<TService2>(GetControlUrl<TService2>(device)));
    }

    private static Uri GetControlUrl<TService>(UpnpDevice device) where TService : IUpnpService
    {
        var serviceType = TService.ServiceSchema;
        var service = device.Services.FirstOrDefault(s => s.ServiceType == serviceType);

        if (service is null)
        {
            if (device.Services.Any(s => s.ServiceType == "urn:xiaomi-com:service:Playlist:1") &&
                UmiMappings.TryGetValue(serviceType, out var template))
            {
                return new(device.Location, string.Format(InvariantCulture, template, device.Udn));
            }

            ServiceNotSupportedException.Throw(serviceType);
        }

        return service.ControlUrl;
    }

    private TService GetService<TService>(Uri controlUrl)
        where TService : SoapActionInvoker, IUpnpServiceFactory<TService>
    {
        var httpClient = clientFactory.CreateClient(nameof(SoapHttpClient));
        httpClient.BaseAddress = controlUrl;
        return TService.Create(new(new SoapHttpClient(httpClient)), null);
    }
}