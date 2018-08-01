using System;
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
    [Route("api/[controller]/{deviceId}")]
    public class PlaylistController : Controller
    {
        private readonly IUpnpServiceFactory factory;

        public PlaylistController(IUpnpServiceFactory factory)
        {
            this.factory = factory;
        }

        [HttpDelete]
        public async Task<object> RemoveAsync(string deviceId, [FromBody] string[] ids)
        {
            var cdService = await factory.GetServiceAsync<ContentDirectoryService>(deviceId);

            var plService = await factory.GetServiceAsync<PlaylistService>(deviceId);

            using(cdService.Target)
            using(plService.Target)
            {
                var data = await cdService.BrowseAsync("PL:", count: uint.MaxValue).ConfigureAwait(false);
                var playlists = DIDLParser.Parse(data["Result"]);
                var map = playlists.Select((p, index) => (p.Id, index)).ToDictionary(p => p.Id, p => p.index + 1);
                var indices = ids.Select(id => map[id]).ToArray();
                var result = await plService.DeleteAsync(indices: indices).ConfigureAwait(false);
                if(result["LengthChange"] == "0")
                {
                    result = await plService.DeleteAsync(updateId: result["NewUpdateID"], indices: indices).ConfigureAwait(false);
                }

                return result;
            }
        }

        [HttpPost]
        public async Task<object> CreateAsync(string deviceId, [FromBody] Playlist playlist)
        {
            var plService = await factory.GetServiceAsync<PlaylistService>(deviceId);

            using(plService.Target)
            {
                return await plService.CreateAsync(title: playlist.Title).ConfigureAwait(false);
            }
        }

        [HttpPut]
        public async Task<object> UpdateAsync(string deviceId, [FromBody] Playlist playlist)
        {
            var plService = await factory.GetServiceAsync<PlaylistService>(deviceId);

            using(plService.Target)
            {
                var result = await plService.RenameAsync(objectId: playlist.Id, title: playlist.Title).ConfigureAwait(false);

                return await plService.RenameAsync(objectId: playlist.Id, title: playlist.Title, updateId: result["NewUpdateID"]).ConfigureAwait(false);
            }
        }

        [HttpPut("{id}/add")]
        public async Task<object> AddAsync(string deviceId, string id, [FromBody] MediaSourceData media)
        {
            var playlistService = await factory.GetServiceAsync<PlaylistService>(deviceId);
            var sourceContentDirectoryService = await factory.GetServiceAsync<ContentDirectoryService>(media.DeviceId);
            var contentDirectoryService = await factory.GetServiceAsync<ContentDirectoryService>(deviceId);

            using(playlistService.Target)
            using(sourceContentDirectoryService.Target)
            using(contentDirectoryService.Target)
            {
                XDocument xdoc = null;

                foreach(var item in media.Items)
                {
                    var data = await sourceContentDirectoryService.BrowseAsync(item, flags: "BrowseMetadata").ConfigureAwait(false);

                    string xml = data["Result"];

                    if(xdoc == null)
                    {
                        xdoc = XDocument.Parse(xml);
                    }
                    else
                    {
                        var x = XDocument.Parse(xml);
                        xdoc.Root.Add(x.Root.Elements());
                    }
                }

                string updateId = await GetUpdateIdAsync(contentDirectoryService, id).ConfigureAwait(false);

                return await playlistService.AddUriAsync(objectId: id, updateId: updateId,
                    enqueuedUriMetaData: xdoc.ToString()).ConfigureAwait(false);
            }
        }

        private async Task<string> GetUpdateIdAsync(ContentDirectoryService cdtService, string id)
        {
            var result = await cdtService.BrowseAsync(id, flags: "BrowseMetadata", filter: "id").ConfigureAwait(false);

            return result["UpdateID"];
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