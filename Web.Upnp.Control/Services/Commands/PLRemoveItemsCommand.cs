using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLRemoveItemsCommand : PLCommandBase, IAsyncCommand<PLRemoveItemsParams>
    {
        public PLRemoveItemsCommand(IUpnpServiceFactory factory) : base(factory) {}

        public async Task ExecuteAsync(PLRemoveItemsParams commandParameters, CancellationToken cancellationToken)
        {
            var (deviceId, playlistId, items) = commandParameters;

            var pls = await Factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var cds = await Factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            var updateId = await GetUpdateIdAsync(cds, playlistId, cancellationToken).ConfigureAwait(false);
            var indices = await GetItemIndices(cds, playlistId, items, cancellationToken).ConfigureAwait(false);

            await pls.RemoveItemsAsync(objectId: playlistId, updateId: updateId, indices: indices, cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}