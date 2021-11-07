using IoT.Device.Upnp.Umi.Services;
using Upnp.Control.Models;
using Upnp.Control.Services;

namespace Web.Upnp.Control.Services.Commands;

public sealed class PLCreateCommandHandler : IAsyncCommandHandler<PLCreateCommand>
{
    private readonly IUpnpServiceFactory factory;

    public PLCreateCommandHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task ExecuteAsync(PLCreateCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var service = await factory.GetServiceAsync<PlaylistService>(command.DeviceId, cancellationToken).ConfigureAwait(false);
        await service.CreateAsync(title: command.Title, cancellationToken: cancellationToken).ConfigureAwait(false);
    }
}