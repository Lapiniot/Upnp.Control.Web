using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Services;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/[controller]/{deviceId}")]
    [Produces("application/json")]
    public class PlaylistController : ControllerBase
    {
        private readonly IUpnpServiceFactory factory;

        public PlaylistController(IUpnpServiceFactory factory)
        {
            this.factory = factory;
        }

        [HttpDelete]
        public async Task<IDictionary<string, string>> RemoveAsync(string deviceId, [FromBody] string[] ids)
        {
            var cdService = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            var plService = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);

            using(cdService.Target)
            using(plService.Target)
            {
                var indices = await GetItemIndices(cdService, "PL:", ids).ConfigureAwait(false);

                var result = await plService.DeleteAsync(indices: indices).ConfigureAwait(false);

                if(result["LengthChange"] == "0")
                {
                    result = await plService.DeleteAsync(updateId: result["NewUpdateID"], indices: indices).ConfigureAwait(false);
                }

                return result;
            }
        }

        [HttpPost]
        public async Task<IDictionary<string, string>> CreateAsync(string deviceId, [FromBody] Playlist playlist)
        {
            var plService = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);

            using(plService.Target)
            {
                return await plService.CreateAsync(title: playlist.Title).ConfigureAwait(false);
            }
        }

        [HttpPut]
        public async Task<IDictionary<string, string>> UpdateAsync(string deviceId, [FromBody] Playlist playlist)
        {
            var plService = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);

            using(plService.Target)
            {
                var result = await plService.RenameAsync(objectId: playlist.Id, title: playlist.Title).ConfigureAwait(false);

                return await plService.RenameAsync(objectId: playlist.Id, title: playlist.Title, updateId: result["NewUpdateID"]).ConfigureAwait(false);
            }
        }

        [HttpPut("{id}/add")]
        public async Task<IDictionary<string, string>> AddAsync(string deviceId, string id, [FromBody] MediaSourceData media)
        {
            var playlistService = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var sourceContentDirectoryService = await factory.GetServiceAsync<ContentDirectoryService>(media.DeviceId).ConfigureAwait(false);
            var contentDirectoryService = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            using(playlistService.Target)
            using(sourceContentDirectoryService.Target)
            using(contentDirectoryService.Target)
            {
                XDocument xdoc = null;

                foreach(var item in media.Items)
                {
                    var data = await sourceContentDirectoryService.BrowseAsync(item, flags: "BrowseMetadata").ConfigureAwait(false);

                    var xml = data["Result"];

                    if(xdoc == null)
                    {
                        xdoc = XDocument.Parse(xml);
                    }
                    else
                    {
                        var x = XDocument.Parse(xml);
                        Debug.Assert(xdoc.Root != null, "xdoc.Root != null");
                        Debug.Assert(x.Root != null, "x.Root != null");
                        xdoc.Root.Add(x.Root.Elements());
                    }
                }

                var updateId = await GetUpdateIdAsync(contentDirectoryService, id).ConfigureAwait(false);

                Debug.Assert(xdoc != null, nameof(xdoc) + " != null");

                return await playlistService.AddUriAsync(objectId: id, updateId: updateId,
                    enqueuedUriMetaData: xdoc.ToString()).ConfigureAwait(false);
            }
        }

        [HttpDelete("{id}/remove")]
        public async Task<IDictionary<string, string>> RemoveAsync(string deviceId, string id, [FromBody] string[] ids)
        {
            var playlistService = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var contentDirectoryService = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            using(playlistService.Target)
            using(contentDirectoryService.Target)
            {
                var updateId = await GetUpdateIdAsync(contentDirectoryService, id).ConfigureAwait(false);
                var indices = await GetItemIndices(contentDirectoryService, id, ids).ConfigureAwait(false);
                return await playlistService.RemoveItemsAsync(objectId: id, updateId: updateId, indices: indices).ConfigureAwait(false);
            }
        }

        private static async Task<string> GetUpdateIdAsync(ContentDirectoryService cdtService, string id)
        {
            var result = await cdtService.BrowseAsync(id, flags: "BrowseMetadata", filter: "id").ConfigureAwait(false);

            return result["UpdateID"];
        }

        private static async Task<int[]> GetItemIndices(ContentDirectoryService cdService, string parentId, IEnumerable<string> ids)
        {
            var data = await cdService.BrowseAsync(parentId, count: uint.MaxValue).ConfigureAwait(false);
            var playlists = DIDLXmlParser.Parse(data["Result"]);
            var map = playlists.Select((p, index) => (p.Id, index)).ToDictionary(p => p.Id, p => p.index + 1);
            return ids.Select(id => map[id]).ToArray();
        }

        public class Playlist
        {
            public string Title { get; set; }

            public string Id { get; set; }
        }

        public class MediaSourceData
        {
            public string DeviceId { get; set; }

            public string[] Items { get; set; }
        }
    }
}