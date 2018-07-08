using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IoT.Protocol.Soap;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using static IoT.Protocol.Upnp.UpnpServices;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]")]
    public class BrowseController : Controller
    {
        private readonly UpnpDbContext context;

        public BrowseController(UpnpDbContext context)
        {
            this.context = context;
        }

        [HttpGet("{deviceId}/{*path}")]
        public async Task<object> GetContentAsync(string deviceId, string path, [FromQuery] uint take = 50, [FromQuery] uint skip = 0, [FromQuery] bool withParents = false)
        {
            ContentDirectoryService service = await GetServiceAsync(deviceId).ConfigureAwait(false);

            using(service.Target)
            {

                var result = await service.BrowseAsync(path ?? "0", index: skip, count: take).ConfigureAwait(false);

                return new
                {
                    Total = int.Parse(result["TotalMatches"]),
                    Result = DIDLParser.Parse(result["Result"]),
                    Parents = withParents ? (await GetParentsAsync(service, path).ConfigureAwait(false)).Select(p => new { p.Id, p.ParentId, p.Title }) : null
                };
            }
        }

        [HttpGet("metadata/{deviceId}/{path?}")]
        public async Task<object> GetMetadataAsync(string deviceId, string path)
        {
            ContentDirectoryService service = await GetServiceAsync(deviceId).ConfigureAwait(false);

            using(service.Target)
            {
                var result = await service.BrowseAsync(path ?? "0", flags: "BrowseMetadata").ConfigureAwait(false);
                return new { Total = int.Parse(result["TotalMatches"]), Result = DIDLParser.Parse(result["Result"]) };
            }
        }

        [HttpGet("parents/{deviceId}/{path?}")]
        public async Task<object> GetParentsAsync(string deviceId, string path)
        {
            ContentDirectoryService service = await GetServiceAsync(deviceId).ConfigureAwait(false);

            using(service.Target)
            {
                return await GetParentsAsync(service, path, "title").ConfigureAwait(false);
            }
        }

        private async Task<ContentDirectoryService> GetServiceAsync(string deviceId)
        {
            var device = await context.UpnpDevices.Include(d => d.Services).Where(d => d.Udn == deviceId).FirstAsync().ConfigureAwait(false);

            var controlUrl = GetControlUrl(device);

            return GetService(controlUrl);
        }

        private static async Task<IEnumerable<Item>> GetParentsAsync(ContentDirectoryService service, string path, string filter = "*")
        {
            var parents = new List<Item>();

            while(path != "-1")
            {
                var metadataResult = await service.BrowseAsync(path ?? "0", flags: "BrowseMetadata", filter: filter).ConfigureAwait(false);

                var metadata = DIDLParser.Parse(metadataResult["Result"]).First();

                parents.Add(metadata);

                path = metadata.ParentId;
            };

            return parents;
        }

        private static Uri GetControlUrl(Device device)
        {
            var contentDirectoryService = device.Services.FirstOrDefault(s => s.ServiceType == ContentDirectory);

            return contentDirectoryService != null
                ? new Uri(contentDirectoryService.ControlUrl)
                : device.Services.Any(s => s.ServiceType == "urn:xiaomi-com:service:Playlist:1")
                    ? new UriBuilder(device.Location) { Path = $"{device.Udn.Substring(5)}-MS/upnp.org-ContentDirectory-1/control" }.Uri
                    : null;
        }

        private static ContentDirectoryService GetService(Uri controlUrl)
        {
            var endpoint = new SoapControlEndpoint(controlUrl);

            var service = new ContentDirectoryService(endpoint);

            endpoint.Connect();

            return service;
        }
    }
}