namespace Upnp.Control.DataAccess.Commands;

internal sealed class RemoveDeviceCommandHandler : IAsyncCommandHandler<RemoveDeviceCommand>
{
    private readonly UpnpDbContext context;

    public RemoveDeviceCommandHandler(UpnpDbContext context) => this.context = context;

    public async Task ExecuteAsync(RemoveDeviceCommand command, CancellationToken cancellationToken)
    {
        var entity = await context.UpnpDevices.FindAsync(new object[] { command.DeviceId }, cancellationToken).ConfigureAwait(false)
            ?? throw new InvalidOperationException("Specified entity is not found");
        context.Remove(entity);
        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}