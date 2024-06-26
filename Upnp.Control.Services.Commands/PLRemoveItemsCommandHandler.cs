namespace Upnp.Control.Services.Commands;

internal sealed class PLRemoveItemsCommandHandler(IUpnpServiceFactory factory) : PLCommandBase(factory), IAsyncCommandHandler<PLRemoveItemsCommand>
{
    public async Task ExecuteAsync(PLRemoveItemsCommand command, CancellationToken cancellationToken)
    {
        var (deviceId, playlistId, items) = command;

        var pls = await GetServiceAsync<PlaylistService>(deviceId, cancellationToken).ConfigureAwait(false);
        var cds = await GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);

        var updateId = await UpnpUtils.GetUpdateIdAsync(cds, playlistId, cancellationToken).ConfigureAwait(false);
        var indices = await UpnpUtils.GetItemIndicesAsync(cds, playlistId, items, cancellationToken).ConfigureAwait(false);

        await pls.RemoveItemsAsync(indices, objectId: playlistId, updateId: updateId, cancellationToken: cancellationToken).ConfigureAwait(false);
    }
}