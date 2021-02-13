using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLRemoveItemsCommandHandler : PLCommandBase, IAsyncCommandHandler<PLRemoveItemsCommand>
    {
        public PLRemoveItemsCommandHandler(IUpnpServiceFactory factory) : base(factory) { }

        public async Task ExecuteAsync(PLRemoveItemsCommand command, CancellationToken cancellationToken)
        {
            var (deviceId, playlistId, items) = command;

            var pls = await GetServiceAsync<PlaylistService>(deviceId, cancellationToken).ConfigureAwait(false);
            var cds = await GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);

            var updateId = await UpnpUtils.GetUpdateIdAsync(cds, playlistId, cancellationToken).ConfigureAwait(false);
            var indices = await UpnpUtils.GetItemIndicesAsync(cds, playlistId, items, cancellationToken).ConfigureAwait(false);

            await pls.RemoveItemsAsync(objectId: playlistId, updateId: updateId, indices: indices, cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}