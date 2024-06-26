namespace Upnp.Control.Services.Commands;

internal sealed class PLRemoveCommandHandler(IUpnpServiceFactory factory) : PLCommandBase(factory), IAsyncCommandHandler<PLRemoveCommand>
{
    public async Task ExecuteAsync(PLRemoveCommand command, CancellationToken cancellationToken)
    {
        var (deviceId, ids) = command;

        var service = await GetServiceAsync<PlaylistService>(deviceId, cancellationToken).ConfigureAwait(false);

        var indices = await GetItemIndicesAsync(deviceId, "PL:", ids, cancellationToken).ConfigureAwait(false);

        var result = await service.DeleteAsync(indices, cancellationToken: cancellationToken).ConfigureAwait(false);

        if (result["LengthChange"] == "0")
        {
            await service.DeleteAsync(indices, updateId: result["NewUpdateID"], cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}