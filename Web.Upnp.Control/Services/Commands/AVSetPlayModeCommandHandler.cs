using IoT.Protocol.Upnp.Services;
using Upnp.Control.Models;
using Upnp.Control.Services;

namespace Web.Upnp.Control.Services.Commands;

public sealed class AVSetPlayModeCommandHandler : IAsyncCommandHandler<AVSetPlayModeCommand>
{
    private readonly IUpnpServiceFactory factory;

    public AVSetPlayModeCommandHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task ExecuteAsync(AVSetPlayModeCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var avt = await factory.GetServiceAsync<AVTransportService>(command.DeviceId, cancellationToken).ConfigureAwait(false);
        await avt.SetPlayModeAsync(0, command.PlayMode, cancellationToken).ConfigureAwait(false);
    }
}