using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Services;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/[controller]/{deviceId}")]
    [Produces("application/json")]
    public class BrowseController : ControllerBase
    {
        private readonly IUpnpServiceFactory factory;

        public BrowseController(IUpnpServiceFactory factory)
        {
            this.factory = factory;
        }

        [HttpGet("{*path}")]
        public async Task GetContentAsync(string deviceId, string path = "0", [FromQuery] uint take = 50, [FromQuery] uint skip = 0,
            [FromQuery] bool withParents = false,
            [FromQuery(Name = "resource")] bool? withResource = false,
            [FromQuery(Name = "vendor")] bool? withVendor = false, CancellationToken cancellationToken = default)
        {
            var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            using(service.Target)
            {
                var result = await service.BrowseAsync(path, index: skip, count: take, cancellationToken: cancellationToken).ConfigureAwait(false);

                await using var jsonWriter = new Utf8JsonWriter(Response.BodyWriter);

                var items = DIDLXmlParser.Parse(result["Result"]);

                var parents = withParents ? await GetParentsAsync(service, path, "id,title,parentId,res", cancellationToken).ConfigureAwait(false) : null;

                DIDLJsonSerializer.Serialize(jsonWriter, int.Parse(result["TotalMatches"]), items, parents, withResource != false, withVendor != false);

                await Response.BodyWriter.FlushAsync(cancellationToken).ConfigureAwait(false);
                await Response.BodyWriter.CompleteAsync().ConfigureAwait(false);
            }
        }

        [HttpGet("metadata/{path?}")]
        public async Task<object> GetMetadataAsync(string deviceId, string path = "0", CancellationToken cancellationToken = default)
        {
            var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            using(service.Target)
            {
                var result = await service.BrowseAsync(path, flags: BrowseFlags.BrowseMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);
                return new {Total = int.Parse(result["TotalMatches"]), Result = DIDLXmlParser.Parse(result["Result"])};
            }
        }

        [HttpGet("parents/{path?}")]
        public async Task<object> GetParentsAsync(string deviceId, string path, CancellationToken cancellationToken = default)
        {
            var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            using(service.Target)
            {
                return await GetParentsAsync(service, path, "title", cancellationToken).ConfigureAwait(false);
            }
        }

        private static async Task<IEnumerable<Item>> GetParentsAsync(ContentDirectoryService service, string path = "0", string filter = "*", CancellationToken cancellationToken = default)
        {
            var parents = new List<Item>();

            while(path != "-1")
            {
                var metadataResult = await service.BrowseAsync(path, flags: BrowseFlags.BrowseMetadata, filter: filter, cancellationToken: cancellationToken).ConfigureAwait(false);

                var metadata = DIDLXmlParser.Parse(metadataResult["Result"]).FirstOrDefault();

                if(metadata == null) break;

                parents.Add(metadata);

                path = metadata.ParentId;
            }

            return parents;
        }
    }
}