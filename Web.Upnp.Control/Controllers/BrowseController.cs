using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IoT.Protocol.Soap;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using Web.Upnp.Control.Models.DIDL;
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

        [HttpGet("{id}/{*path}")]
        public async Task<object> GetContentAsync(string id, string path, [FromQuery] uint take = 50, [FromQuery] uint skip = 0)
        {
            var device = await context.UpnpDevices.Include(d => d.Services).Where(d => d.Udn == id).FirstAsync().ConfigureAwait(false);

            var controlUrl = GetControlUrl(device);

            if(controlUrl != null)
            {
                var service = GetService(controlUrl);

                using(service.Target)
                {
                    var result = await service.BrowseAsync(path ?? "0", index: skip, count: take).ConfigureAwait(false);
                    return new { Total = int.Parse(result["TotalMatches"]), Result = DIDLParser.Parse(result["Result"]) };
                }
            }

            return null;
        }

        [HttpGet("metadata/{id}/{path?}")]
        public async Task<object> GetMetadataAsync(string id, string path)
        {
            var device = await context.UpnpDevices.Include(d => d.Services).Where(d => d.Udn == id).FirstAsync().ConfigureAwait(false);

            var controlUrl = GetControlUrl(device);

            if(controlUrl != null)
            {
                var service = GetService(controlUrl);

                using(service.Target)
                {
                    var result = await service.BrowseAsync(path ?? "0", flags: "BrowseMetadata").ConfigureAwait(false);
                    return new { Total = int.Parse(result["TotalMatches"]), Result = DIDLParser.Parse(result["Result"]) };
                }
            }

            return null;
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