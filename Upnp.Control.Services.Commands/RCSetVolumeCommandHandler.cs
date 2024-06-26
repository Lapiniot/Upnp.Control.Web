namespace Upnp.Control.Services.Commands;

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
        var (deviceId, volume) = command;
        var service = await factory.GetServiceAsync<RenderingControlService>(deviceId, cancellationToken).ConfigureAwait(false);
        await service.SetVolumeAsync(0, volume, cancellationToken).ConfigureAwait(false);
    }
}