using IoT.Protocol.Upnp;
using static System.Globalization.CultureInfo;

namespace Upnp.Control.Infrastructure.Upnp;

public class UpnpServiceFactory : IUpnpServiceFactory
{
    private static readonly IDictionary<string, string> UmiMappings = new Dictionary<string, string>
        {
            {"urn:schemas-upnp-org:service:ContentDirectory:1", "/{0}-MS/upnp.org-ContentDirectory-1/control"},
            {"urn:schemas-upnp-org:service:AVTransport:1", "/{0}-MR/upnp.org-AVTransport-1/control"},
            {"urn:xiaomi-com:service:SystemProperties:1", "/{0}/xiaomi.com-SystemProperties-1/control"},
            {"urn:schemas-upnp-org:service:ConnectionManager:1", "/{0}-MR/upnp.org-ConnectionManager-1/control"},
            {"urn:schemas-upnp-org:service:RenderingControl:1", "/{0}-MR/upnp.org-RenderingControl-1/control"}
        };

    private readonly IHttpClientFactory clientFactory;
    private readonly IAsyncQueryHandler<GetDeviceQuery, Models.UpnpDevice> queryHandler;

    public UpnpServiceFactory(IHttpClientFactory clientFactory, IAsyncQueryHandler<GetDeviceQuery, Models.UpnpDevice> queryHandler)
    {
        this.clientFactory = clientFactory;
        this.queryHandler = queryHandler;
    }

    public async Task<(TService, DeviceDescription)> GetAsync<TService>(string deviceId, CancellationToken cancellationToken)
        where TService : SoapActionInvoker, IUpnpService
    {
        var device = await FindDeviceAsync(deviceId, cancellationToken).ConfigureAwait(false);

        return (GetService<TService>(GetControlUrl<TService>(device)),
            new(device.Udn, device.FriendlyName, device.Description));
    }

    public async Task<TService> GetServiceAsync<TService>(string deviceId, CancellationToken cancellationToken)
        where TService : SoapActionInvoker, IUpnpService
    {
        var device = await FindDeviceAsync(deviceId, cancellationToken).ConfigureAwait(false);

        return GetService<TService>(controlUrl: GetControlUrl<TService>(device));
    }

    public async Task<(TService1, TService2)> GetServicesAsync<TService1, TService2>(string deviceId, CancellationToken cancellationToken)
        where TService1 : SoapActionInvoker, IUpnpService
        where TService2 : SoapActionInvoker, IUpnpService
    {
        var device = await FindDeviceAsync(deviceId, cancellationToken).ConfigureAwait(false);

        return (GetService<TService1>(GetControlUrl<TService1>(device)),
            GetService<TService2>(GetControlUrl<TService2>(device)));
    }

    private async Task<Models.UpnpDevice> FindDeviceAsync(string deviceId, CancellationToken cancellationToken)
    {
        var device = await queryHandler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);
        if (device is null) DeviceNotFoundException.Throw(deviceId);
        return device;
    }

    private static Uri GetControlUrl<TService>(Models.UpnpDevice device)
        where TService : IUpnpService
    {
        var serviceType = TService.ServiceSchema;
        var service = device.Services.FirstOrDefault(s => s.ServiceType == serviceType);

        if (service is null)
        {
            if (device.Services.Any(s => s.ServiceType == "urn:xiaomi-com:service:Playlist:1") &&
                UmiMappings.TryGetValue(serviceType, out var template))
            {
                return new Uri(device.Location, string.Format(InvariantCulture, template, device.Udn));
            }

            ServiceNotSupportedException.Throw(serviceType);
        }

        return service.ControlUrl;
    }

    private T GetService<T>(Uri controlUrl)
    {
        var httpClient = clientFactory.CreateClient(nameof(SoapHttpClient));

        httpClient.BaseAddress = controlUrl;

        var endpoint = new SoapControlEndpoint(new SoapHttpClient(httpClient));

        return (T)Activator.CreateInstance(typeof(T), endpoint);
    }
}