using IoT.Protocol.Soap;
using Upnp.Control.Abstractions;
using Upnp.Control.Models;

using static IoT.Device.DeviceFactory<IoT.Protocol.Soap.SoapActionInvoker>;
using static System.Globalization.CultureInfo;

namespace Upnp.Control.Infrastructure.Upnp;

public class UpnpServiceFactory : IUpnpServiceFactory
{
    private static readonly IDictionary<string, string> UmiMappings = new Dictionary<string, string>
        {
            {"urn:schemas-upnp-org:service:ContentDirectory:1", "{0}-MS/upnp.org-ContentDirectory-1/control"},
            {"urn:schemas-upnp-org:service:AVTransport:1", "{0}-MR/upnp.org-AVTransport-1/control"},
            {"urn:xiaomi-com:service:SystemProperties:1", "{0}/xiaomi.com-SystemProperties-1/control"},
            {"urn:schemas-upnp-org:service:ConnectionManager:1", "{0}-MR/upnp.org-ConnectionManager-1/control"},
            {"urn:schemas-upnp-org:service:RenderingControl:1", "{0}-MR/upnp.org-RenderingControl-1/control"}
        };

    private readonly IHttpClientFactory clientFactory;
    private readonly IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> queryHandler;

    public UpnpServiceFactory(IHttpClientFactory clientFactory, IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> queryHandler)
    {
        this.clientFactory = clientFactory;
        this.queryHandler = queryHandler;
    }

    public async Task<(TService, DeviceDescription)> GetAsync<TService>(string deviceId, CancellationToken cancellationToken) where TService : SoapActionInvoker
    {
        var device = await queryHandler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);

        return (GetService<TService>(GetControlUrl(device, GetModelName<TService>())),
            new(device.Udn, device.FriendlyName, device.Description));
    }

    public async Task<TService> GetServiceAsync<TService>(string deviceId, CancellationToken cancellationToken)
        where TService : SoapActionInvoker
    {
        var device = await queryHandler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);

        return GetService<TService>(GetControlUrl(device, GetModelName<TService>()));
    }

    public async Task<(TService1, TService2)> GetServicesAsync<TService1, TService2>(string deviceId, CancellationToken cancellationToken)
        where TService1 : SoapActionInvoker where TService2 : SoapActionInvoker
    {
        var device = await queryHandler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);

        return (GetService<TService1>(GetControlUrl(device, GetModelName<TService1>())),
            GetService<TService2>(GetControlUrl(device, GetModelName<TService2>())));
    }

    public async Task<(TService1, TService2, TService3)> GetServicesAsync<TService1, TService2, TService3>(string deviceId, CancellationToken cancellationToken)
        where TService1 : SoapActionInvoker
        where TService2 : SoapActionInvoker
        where TService3 : SoapActionInvoker
    {
        var device = await queryHandler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);

        return (GetService<TService1>(GetControlUrl(device, GetModelName<TService1>())),
            GetService<TService2>(GetControlUrl(device, GetModelName<TService2>())),
            GetService<TService3>(GetControlUrl(device, GetModelName<TService3>())));
    }

    private static Uri GetControlUrl(UpnpDevice device, string schema)
    {
        var service = device.Services.FirstOrDefault(s => s.ServiceType == schema);

        return service != null
            ? service.ControlUrl
            : device.Services.Any(s => s.ServiceType == "urn:xiaomi-com:service:Playlist:1")
                ? new UriBuilder(device.Location) { Path = string.Format(InvariantCulture, UmiMappings[schema], device.Udn) }.Uri
                : null;
    }

    private T GetService<T>(Uri controlUrl)
    {
        var httpClient = clientFactory.CreateClient(nameof(SoapHttpClient));

        httpClient.BaseAddress = controlUrl;

        var endpoint = new SoapControlEndpoint(new SoapHttpClient(httpClient));

        return (T)Activator.CreateInstance(typeof(T), endpoint);
    }
}