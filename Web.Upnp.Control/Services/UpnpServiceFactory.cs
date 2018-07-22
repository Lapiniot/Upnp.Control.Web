using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using IoT.Protocol.Soap;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using IoT.Protocol.Upnp.Services;
using System.Collections.Concurrent;

namespace Web.Upnp.Control.Services
{
    public class UpnpServiceFactory : IUpnpServiceFactory
    {
        static ConcurrentDictionary<Type, string> cache = new ConcurrentDictionary<Type, string>();
        static IDictionary<string, string> umiMappings = new Dictionary<string, string>(){
            {"urn:schemas-upnp-org:service:ContentDirectory:1", "{0}-MS/upnp.org-ContentDirectory-1/control"},
            {"urn:schemas-upnp-org:service:AVTransport:1", "{0}-MR/upnp.org-AVTransport-1/control"},
            {"urn:xiaomi-com:service:SystemProperties:1", "{0}/xiaomi.com-SystemProperties-1/control"},
            {"urn:schemas-upnp-org:service:ConnectionManager:1", "{0}-MR/upnp.org-ConnectionManager-1/control"},
            {"urn:schemas-upnp-org:service:RenderingControl:1", "{0}-MR/upnp.org-RenderingControl-1/control"},
        };

        private readonly UpnpDbContext context;
        private readonly IHttpClientFactory clientFactory;
        public UpnpServiceFactory(UpnpDbContext context, IHttpClientFactory clientFactory)
        {
            this.clientFactory = clientFactory;
            this.context = context;
        }

        public async Task<TService> GetServiceAsync<TService>(string deviceId, string schema = null) where TService : SoapActionInvoker
        {
            var device = await context.UpnpDevices
                .Include(d => d.Services)
                .Where(d => d.Udn == deviceId)
                .FirstAsync()
                .ConfigureAwait(false);

            schema = schema ?? cache.GetOrAdd(typeof(TService), type => ServiceSchemaAttribute.GetSchema(type));

            var controlUrl = GetControlUrl(device, schema);

            return GetService<TService>(controlUrl);
        }

        private static Uri GetControlUrl(Device device, string schema)
        {
            var service = device.Services.FirstOrDefault(s => s.ServiceType == schema);

            return service != null
                ? new Uri(service.ControlUrl)
                : device.Services.Any(s => s.ServiceType == "urn:xiaomi-com:service:Playlist:1")
                    ? new UriBuilder(device.Location) { Path = string.Format(umiMappings[schema], device.Udn.Substring(5)) }.Uri
                    : null;
        }

        private static T GetService<T>(Uri controlUrl)
        {
            var endpoint = new SoapControlEndpoint(controlUrl);

            endpoint.Connect();

            return (T)Activator.CreateInstance(typeof(T), endpoint);
        }
    }
}