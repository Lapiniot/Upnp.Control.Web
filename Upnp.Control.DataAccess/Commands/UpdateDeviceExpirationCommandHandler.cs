namespace Upnp.Control.DataAccess.Commands;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal class UpdateDeviceExpirationCommandHandler : IAsyncCommandHandler<UpdateDeviceExpirationCommand>
{
    private readonly UpnpDbContext context;

    public UpdateDeviceExpirationCommandHandler(UpnpDbContext context)
    {
        this.context = context;
    }

    public async Task ExecuteAsync(UpdateDeviceExpirationCommand command, CancellationToken cancellationToken)
    {
        var entity = await context.UpnpDevices.FindAsync(new object[] { command.DeviceId }, cancellationToken).ConfigureAwait(false);

        if(entity is null)
        {
            throw new InvalidOperationException("Specified entity is not found");
        }

        context.Entry(entity).Property(e => e.ExpiresAt).CurrentValue = command.ExpiresAt;

        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}