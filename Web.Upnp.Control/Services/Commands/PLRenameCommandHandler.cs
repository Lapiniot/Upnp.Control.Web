using IoT.Device.Upnp.Umi.Services;
using Upnp.Control.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands;

public sealed class PLRenameCommandHandler : IAsyncCommandHandler<PLRenameCommand>
{
    private readonly IUpnpServiceFactory factory;

    public PLRenameCommandHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task ExecuteAsync(PLRenameCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var (deviceId, playlistId, title) = command;
        var service = await factory.GetServiceAsync<PlaylistService>(deviceId, cancellationToken).ConfigureAwait(false);
        var result = await service.RenameAsync(objectId: playlistId, title: title, cancellationToken: cancellationToken).ConfigureAwait(false);
        await service.RenameAsync(objectId: playlistId, title: title, updateId: result["NewUpdateID"], cancellationToken: cancellationToken).ConfigureAwait(false);
    }
}