using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static IoT.Protocol.Upnp.Services.BrowseMode;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/devices/{deviceId}/playlists")]
    [Produces("application/json")]
    public class PlaylistController : ControllerBase
    {
        private readonly IUpnpServiceFactory factory;

        public PlaylistController(IUpnpServiceFactory factory)
        {
            this.factory = factory;
        }

        [HttpPost]
        public async Task<IDictionary<string, string>> CreateAsync(string deviceId, [FromBody] string title, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);

            return await service.CreateAsync(title: title, cancellationToken: cancellationToken).ConfigureAwait(false);
        }

        [HttpPut("{playlistId}")]
        public async Task<IDictionary<string, string>> UpdateAsync(string deviceId, string playlistId, [FromBody] string title, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);

            var result = await service.RenameAsync(objectId: playlistId, title: title, cancellationToken: cancellationToken).ConfigureAwait(false);

            return await service.RenameAsync(objectId: playlistId, title: title, updateId: result["NewUpdateID"], cancellationToken: cancellationToken).ConfigureAwait(false);
        }

        [HttpDelete]
        public async Task<IDictionary<string, string>> RemoveAsync(string deviceId, [FromBody] string[] ids, CancellationToken cancellationToken)
        {
            var cds = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            var pls = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);

            var indices = await GetItemIndices(cds, "PL:", ids, cancellationToken).ConfigureAwait(false);

            var result = await pls.DeleteAsync(indices: indices, cancellationToken: cancellationToken).ConfigureAwait(false);

            if(result["LengthChange"] == "0")
            {
                result = await pls.DeleteAsync(updateId: result["NewUpdateID"], indices: indices, cancellationToken: cancellationToken).ConfigureAwait(false);
            }

            return result;
        }

        [HttpPut("{playlistId}/items")]
        public async Task<IDictionary<string, string>> AddItemsAsync(string deviceId, string playlistId, [FromBody] MediaSource media, CancellationToken cancellationToken)
        {
            var playlistService = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var sourceContentDirectoryService = await factory.GetServiceAsync<ContentDirectoryService>(media.DeviceId).ConfigureAwait(false);
            var contentDirectoryService = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            XDocument xdoc = null;

            foreach(var item in media.Items)
            {
                var data = await sourceContentDirectoryService.BrowseAsync(item, mode: BrowseMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);

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

            var updateId = await GetUpdateIdAsync(contentDirectoryService, playlistId, cancellationToken).ConfigureAwait(false);

            Debug.Assert(xdoc != null, nameof(xdoc) + " != null");

            return await playlistService.AddUriAsync(objectId: playlistId, updateId: updateId, enqueuedUriMetaData: xdoc.ToString(), cancellationToken: cancellationToken).ConfigureAwait(false);
        }

        [HttpDelete("{playlistId}/items")]
        public async Task<IDictionary<string, string>> RemoveItemsAsync(string deviceId, string playlistId, [FromBody] string[] ids, CancellationToken cancellationToken)
        {
            var pls = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var cds = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            var updateId = await GetUpdateIdAsync(cds, playlistId, cancellationToken).ConfigureAwait(false);
            var indices = await GetItemIndices(cds, playlistId, ids, cancellationToken).ConfigureAwait(false);
            return await pls.RemoveItemsAsync(objectId: playlistId, updateId: updateId, indices: indices, cancellationToken: cancellationToken).ConfigureAwait(false);
        }

        private static async Task<string> GetUpdateIdAsync(ContentDirectoryService cdtService, string id, CancellationToken cancellationToken)
        {
            return (await cdtService.BrowseAsync(id, mode: BrowseMetadata, filter: "id", cancellationToken: cancellationToken).ConfigureAwait(false))["UpdateID"];
        }

        private static async Task<int[]> GetItemIndices(ContentDirectoryService cdService, string parentId, IEnumerable<string> ids, CancellationToken cancellationToken)
        {
            var data = await cdService.BrowseAsync(parentId, count: uint.MaxValue, cancellationToken: cancellationToken).ConfigureAwait(false);
            var playlists = DIDLXmlParser.Parse(data["Result"]);
            var map = playlists.Select((p, index) => (p.Id, index)).ToDictionary(p => p.Id, p => p.index + 1);
            return ids.Select(id => map[id]).ToArray();
        }
    }
}