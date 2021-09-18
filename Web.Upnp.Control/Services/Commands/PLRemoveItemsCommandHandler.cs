using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands;

public sealed class PLRemoveItemsCommandHandler : PLCommandBase, IAsyncCommandHandler<PLRemoveItemsCommand>
{
    public PLRemoveItemsCommandHandler(IUpnpServiceFactory factory) : base(factory) { }

    public async Task ExecuteAsync(PLRemoveItemsCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var (deviceId, playlistId, items) = command;

        var pls = await GetServiceAsync<PlaylistService>(deviceId, cancellationToken).ConfigureAwait(false);
        var cds = await GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);

        var updateId = await UpnpUtils.GetUpdateIdAsync(cds, playlistId, cancellationToken).ConfigureAwait(false);
        var indices = await UpnpUtils.GetItemIndicesAsync(cds, playlistId, items, cancellationToken).ConfigureAwait(false);

        await pls.RemoveItemsAsync(indices, objectId: playlistId, updateId: updateId, cancellationToken: cancellationToken).ConfigureAwait(false);
    }
}