namespace Upnp.Control.Services.Commands;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
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
        ArgumentNullException.ThrowIfNull(command);

        var avt = await factory.GetServiceAsync<AVTransportService>(command.DeviceId, cancellationToken).ConfigureAwait(false);
        await avt.SetPlayModeAsync(0, command.PlayMode, cancellationToken).ConfigureAwait(false);
    }
}