namespace Upnp.Control.Services.Commands;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class PLRemoveCommandHandler : PLCommandBase, IAsyncCommandHandler<PLRemoveCommand>
{
    public PLRemoveCommandHandler(IUpnpServiceFactory factory) : base(factory) { }

    public async Task ExecuteAsync(PLRemoveCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var (deviceId, ids) = command;

        var service = await GetServiceAsync<PlaylistService>(deviceId, cancellationToken).ConfigureAwait(false);

        var indices = await GetItemIndicesAsync(deviceId, "PL:", ids, cancellationToken).ConfigureAwait(false);

        var result = await service.DeleteAsync(indices, cancellationToken: cancellationToken).ConfigureAwait(false);

        if(result["LengthChange"] == "0")
        {
            await service.DeleteAsync(indices, updateId: result["NewUpdateID"], cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}