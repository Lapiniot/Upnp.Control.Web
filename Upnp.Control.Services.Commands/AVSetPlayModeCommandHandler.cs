namespace Upnp.Control.Services.Commands;

internal sealed class AVSetPlayModeCommandHandler : IAsyncCommandHandler<AVSetPlayModeCommand>
{
    private readonly IUpnpServiceFactory factory;

    public AVSetPlayModeCommandHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task ExecuteAsync(AVSetPlayModeCommand command, CancellationToken cancellationToken)
    {
        var avt = await factory.GetServiceAsync<AVTransportService>(command.DeviceId, cancellationToken).ConfigureAwait(false);
        await avt.SetPlayModeAsync(0, command.PlayMode, cancellationToken).ConfigureAwait(false);
    }
}