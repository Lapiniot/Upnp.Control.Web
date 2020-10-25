using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using IoT.Protocol.Soap;
using IoT.Protocol.Upnp.Services;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services
{
    public class UpnpServiceFactory : IUpnpServiceFactory
    {
        private static readonly ConcurrentDictionary<Type, string> Cache = new ConcurrentDictionary<Type, string>();

        private static readonly IDictionary<string, string> UmiMappings = new Dictionary<string, string>
        {
            {"urn:schemas-upnp-org:service:ContentDirectory:1", "{0}-MS/upnp.org-ContentDirectory-1/control"},
            {"urn:schemas-upnp-org:service:AVTransport:1", "{0}-MR/upnp.org-AVTransport-1/control"},
            {"urn:xiaomi-com:service:SystemProperties:1", "{0}/xiaomi.com-SystemProperties-1/control"},
            {"urn:schemas-upnp-org:service:ConnectionManager:1", "{0}-MR/upnp.org-ConnectionManager-1/control"},
            {"urn:schemas-upnp-org:service:RenderingControl:1", "{0}-MR/upnp.org-RenderingControl-1/control"}
        };

        private readonly IHttpClientFactory clientFactory;

        private readonly UpnpDbContext context;

        public UpnpServiceFactory(UpnpDbContext context, IHttpClientFactory clientFactory)
        {
            this.context = context;
            this.clientFactory = clientFactory;
        }

        public async Task<TService> GetServiceAsync<TService>(string deviceId, string schema = null) where TService : SoapActionInvoker
        {
            var device = await context.UpnpDevices.FindAsync(new[] { deviceId }).ConfigureAwait(false);

            schema ??= Cache.GetOrAdd(typeof(TService), ServiceSchemaAttribute.GetSchema);

            var controlUrl = GetControlUrl(device, schema);

            return GetService<TService>(controlUrl);
        }

        private static Uri GetControlUrl(Device device, string schema)
        {
            var service = device.Services.FirstOrDefault(s => s.ServiceType == schema);

            return service != null
                ? service.ControlUrl
                : device.Services.Any(s => s.ServiceType == "urn:xiaomi-com:service:Playlist:1")
                    ? new UriBuilder(device.Location) { Path = string.Format(UmiMappings[schema], device.Udn) }.Uri
                    : null;
        }

        private T GetService<T>(Uri controlUrl)
        {
            var httpClient = clientFactory.CreateClient("HttpSoapClient");

            httpClient.BaseAddress = controlUrl;

            var endpoint = new SoapControlEndpoint(httpClient);

            return (T)Activator.CreateInstance(typeof(T), endpoint);
        }
    }
}