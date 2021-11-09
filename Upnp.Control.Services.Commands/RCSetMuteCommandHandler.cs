namespace Upnp.Control.Services.Commands;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class RCSetMuteCommandHandler : IAsyncCommandHandler<RCSetMuteCommand>
{
    private readonly IUpnpServiceFactory factory;

    public RCSetMuteCommandHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task ExecuteAsync(RCSetMuteCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var (deviceId, mute) = command;
        var service = await factory.GetServiceAsync<RenderingControlService>(deviceId, cancellationToken).ConfigureAwait(false);
        await service.SetMuteAsync(0, mute, cancellationToken).ConfigureAwait(false);
    }
}