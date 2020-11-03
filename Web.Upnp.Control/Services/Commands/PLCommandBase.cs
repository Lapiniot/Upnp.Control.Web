using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Services.Abstractions;
using static IoT.Protocol.Upnp.Services.BrowseMode;

namespace Web.Upnp.Control.Services.Commands
{
    public abstract class PLCommandBase
    {
        protected IUpnpServiceFactory Factory { get; }

        protected PLCommandBase(IUpnpServiceFactory factory)
        {
            this.Factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        protected async Task<int[]> GetItemIndices(string deviceId, string parentId, IEnumerable<string> ids, CancellationToken cancellationToken)
        {
            var service = await Factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            return await GetItemIndices(service, parentId, ids, cancellationToken).ConfigureAwait(false);
        }

        protected async Task<string> GetUpdateIdAsync(string deviceId, string itemId, CancellationToken cancellationToken)
        {
            var service = await Factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            return await GetUpdateIdAsync(service, itemId, cancellationToken).ConfigureAwait(false);
        }

        protected static async Task<int[]> GetItemIndices(ContentDirectoryService service, string parentId, IEnumerable<string> ids, CancellationToken cancellationToken)
        {
            var data = await service.BrowseAsync(parentId, count: uint.MaxValue, cancellationToken: cancellationToken).ConfigureAwait(false);
            var playlists = DIDLXmlParser.Parse(data["Result"]);
            var map = playlists.Select((p, index) => (p.Id, index)).ToDictionary(p => p.Id, p => p.index + 1);
            return ids.Select(id => map[id]).ToArray();
        }

        protected static async Task<string> GetUpdateIdAsync(ContentDirectoryService service, string itemId, CancellationToken cancellationToken)
        {
            return (await service.BrowseAsync(itemId, mode: BrowseMetadata, filter: "id", cancellationToken: cancellationToken).ConfigureAwait(false))["UpdateID"];
        }
    }
}