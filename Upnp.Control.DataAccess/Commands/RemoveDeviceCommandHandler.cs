namespace Upnp.Control.DataAccess.Commands;

internal sealed class RemoveDeviceCommandHandler(UpnpDbContext context) : IAsyncCommandHandler<RemoveDeviceCommand>
{
    public async Task ExecuteAsync(RemoveDeviceCommand command, CancellationToken cancellationToken) =>
        await context.UpnpDevices
            .Where(d => d.Udn == command.DeviceId)
            .ExecuteDeleteAsync(cancellationToken)
            .ConfigureAwait(false);
}