using System.Collections.Generic;
using System.IO.Pipelines;
using System.Linq;
using System.Text.Json;
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
        public async Task GetContentAsync(string deviceId, string path, [FromQuery] uint take = 50, [FromQuery] uint skip = 0,
            [FromQuery] bool withParents = false,
            [FromQuery(Name = "resource")] bool? withResource = false,
            [FromQuery(Name = "vendor")] bool? withVendor = false)
        {
            var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            using(service.Target)
            {
                var result = await service.BrowseAsync(path ?? "0", index: skip, count: take).ConfigureAwait(false);

                WriteResponse(Response.BodyWriter,
                    int.Parse(result["TotalMatches"]),
                    DIDLParser.Parse(result["Result"]),
                    withParents ? await GetParentsAsync(service, path).ConfigureAwait(false) : null,
                    withResource != false, withVendor != false);

                await Response.BodyWriter.FlushAsync().ConfigureAwait(false);
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

        private static void WriteResponse(PipeWriter writer, int total, IEnumerable<Item> items, IEnumerable<Item> parents,
            bool emmitResourceData, bool emmitVendorData)
        {
            var w = new Utf8JsonWriter(writer);

            w.WriteStartObject();
            w.WriteNumber("total", total);

            w.WriteStartArray("result");
            foreach(var item in items)
            {
                w.WriteStartObject();
                w.WriteString("id", item.Id);
                w.WriteBoolean("container", item is Container);
                w.WriteString("class", item.Class);
                w.WriteString("title", item.Title);

                if(item.AlbumArts != null)
                {
                    w.WriteStartArray("albumArts");
                    foreach(var art in item.AlbumArts) w.WriteStringValue(art);
                    w.WriteEndArray();
                }

                if(emmitResourceData && item.Resource is { } r)
                {
                    w.WriteStartObject("res");
                    w.WriteString("url", r.Url);
                    w.WriteString("proto", r.Protocol);

                    if(r.Attributes is { Count: var count } && count > 0)
                    {
                        foreach(var (k, v) in r.Attributes) w.WriteString(k, v);
                    }

                    w.WriteEndObject();
                }

                if(emmitVendorData && item.Vendor is { } vendor && vendor.Count > 0)
                {
                    w.WriteStartObject("vendor");
                    foreach(var (k, v) in vendor)
                    {
                        if(!string.IsNullOrEmpty(v)) w.WriteString(k, v);
                    }
                    w.WriteEndObject();
                }

                w.WriteEndObject();
            }

            w.WriteEndArray();

            if(parents != null)
            {
                w.WriteStartArray("parents");
                foreach(var parent in parents)
                {
                    w.WriteStartObject();
                    w.WriteString("id", parent.Id);
                    w.WriteString("parentId", parent.ParentId);
                    w.WriteString("title", parent.Title);
                    w.WriteEndObject();
                }

                w.WriteEndArray();
            }

            w.WriteEndObject();
            w.Flush();
        }
    }
}