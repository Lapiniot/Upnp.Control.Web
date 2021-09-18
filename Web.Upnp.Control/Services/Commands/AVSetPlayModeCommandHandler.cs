using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands;

public sealed class AVSetPlayModeCommandHandler : IAsyncCommandHandler<AVSetPlayModeCommand>
{
    private readonly IUpnpServiceFactory factory;

    public AVSetPlayModeCommandHandler(IUpnpServiceFactory factory)
    {
        this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
    }

    public async Task ExecuteAsync(AVSetPlayModeCommand command, CancellationToken cancellationToken)
    {
        if(command is null) throw new ArgumentNullException(nameof(command));
        var avt = await factory.GetServiceAsync<AVTransportService>(command.DeviceId, cancellationToken).ConfigureAwait(false);
        await avt.SetPlayModeAsync(0, command.PlayMode, cancellationToken).ConfigureAwait(false);
    }
}