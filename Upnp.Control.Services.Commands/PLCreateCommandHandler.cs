namespace Upnp.Control.Services.Commands;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class PLCreateCommandHandler : IAsyncCommandHandler<PLCreateCommand>
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