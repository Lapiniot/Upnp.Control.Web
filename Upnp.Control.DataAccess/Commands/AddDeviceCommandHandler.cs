namespace Upnp.Control.DataAccess.Commands;

internal sealed class AddDeviceCommandHandler(UpnpDbContext context) : ICommandHandler<AddDeviceCommand>
{
    public Task ExecuteAsync(AddDeviceCommand command, CancellationToken cancellationToken)
    {
        context.Add(command.Device);
        return context.SaveChangesAsync(cancellationToken);
    }
}