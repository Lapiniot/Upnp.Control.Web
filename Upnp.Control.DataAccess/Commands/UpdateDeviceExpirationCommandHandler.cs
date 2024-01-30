namespace Upnp.Control.DataAccess.Commands;

internal sealed class UpdateDeviceExpirationCommandHandler(UpnpDbContext context) : IAsyncCommandHandler<UpdateDeviceExpirationCommand>
{
    public async Task ExecuteAsync(UpdateDeviceExpirationCommand command, CancellationToken cancellationToken) =>
        await context.UpnpDevices
            .Where(d => d.Udn == command.DeviceId)
            .ExecuteUpdateAsync(d => d.SetProperty(d => d.ExpiresAt, command.ExpiresAt), cancellationToken)
            .ConfigureAwait(false);
}