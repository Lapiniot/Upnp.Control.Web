using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]/{deviceId}")]
    public class BrowseController : Controller
    {
        private readonly IUpnpServiceFactory factory;

        public BrowseController(IUpnpServiceFactory factory)
        {
            this.factory = factory;
        }

        [HttpGet("{*path}")]
        public async Task<object> GetContentAsync(string deviceId, string path, [FromQuery] uint take = 50, [FromQuery] uint skip = 0, [FromQuery] bool withParents = false)
        {
            var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            using(service.Target)
            {
                var result = await service.BrowseAsync(path ?? "0", index: skip, count: take).ConfigureAwait(false);

                return new
                {
                    Total = int.Parse(result["TotalMatches"]),
                    Result = DIDLParser.Parse(result["Result"]),
                    Parents = withParents ? (await GetParentsAsync(service, path).ConfigureAwait(false)).Select(p => new {p.Id, p.ParentId, p.Title}) : null
                };
            }
        }

        [HttpGet("metadata/{path?}")]
        public async Task<object> GetMetadataAsync(string deviceId, string path)
        {
            var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            using(service.Target)
            {
                var result = await service.BrowseAsync(path ?? "0", flags: "BrowseMetadata").ConfigureAwait(false);
                return new {Total = int.Parse(result["TotalMatches"]), Result = DIDLParser.Parse(result["Result"])};
            }
        }

        [HttpGet("parents/{path?}")]
        public async Task<object> GetParentsAsync(string deviceId, string path)
        {
            var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            using(service.Target)
            {
                return await GetParentsAsync(service, path, "title").ConfigureAwait(false);
            }
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
            }

            return parents;
        }
    }
}