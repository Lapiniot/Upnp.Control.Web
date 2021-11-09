namespace Upnp.Control.Services.Commands;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class RCSetVolumeCommandHandler : IAsyncCommandHandler<RCSetVolumeCommand>
{
    private readonly IUpnpServiceFactory factory;

    public RCSetVolumeCommandHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task ExecuteAsync(RCSetVolumeCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var (deviceId, volume) = command;
        var service = await factory.GetServiceAsync<RenderingControlService>(deviceId, cancellationToken).ConfigureAwait(false);
        await service.SetVolumeAsync(0, volume, cancellationToken).ConfigureAwait(false);
    }
}