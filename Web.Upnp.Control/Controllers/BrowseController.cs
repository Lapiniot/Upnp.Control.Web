﻿using System.Collections.Generic;
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

                await using var jsonWriter = new Utf8JsonWriter(Response.BodyWriter);

                DIDLJsonSerializer.Serialize(jsonWriter, int.Parse(result["TotalMatches"]), DIDLXmlParser.Parse(result["Result"]),
                    withParents ? await GetParentsAsync(service, path).ConfigureAwait(false) : null, withResource != false, withVendor != false);

                await Response.BodyWriter.FlushAsync().ConfigureAwait(false);
                await Response.BodyWriter.CompleteAsync().ConfigureAwait(false);
            }
        }

        [HttpGet("metadata/{path?}")]
        public async Task<object> GetMetadataAsync(string deviceId, string path)
        {
            var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            using(service.Target)
            {
                var result = await service.BrowseAsync(path ?? "0", flags: "BrowseMetadata").ConfigureAwait(false);
                return new {Total = int.Parse(result["TotalMatches"]), Result = DIDLXmlParser.Parse(result["Result"])};
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

                var metadata = DIDLXmlParser.Parse(metadataResult["Result"]).First();

                parents.Add(metadata);

                path = metadata.ParentId;
            }

            return parents;
        }
    }
}