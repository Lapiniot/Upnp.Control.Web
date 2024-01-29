namespace Upnp.Control.DataAccess.Commands;

internal sealed class RemoveDeviceCommandHandler(UpnpDbContext context) : IAsyncCommandHandler<RemoveDeviceCommand>
{
    public async Task ExecuteAsync(RemoveDeviceCommand command, CancellationToken cancellationToken)
    {
        var entity = await context.UpnpDevices.FindAsync([command.DeviceId], cancellationToken).ConfigureAwait(false)
            ?? throw new InvalidOperationException("Specified entity is not found");
        context.Remove(entity);
        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}