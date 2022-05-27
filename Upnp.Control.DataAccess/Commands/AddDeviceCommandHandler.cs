namespace Upnp.Control.DataAccess.Commands;

internal sealed class AddDeviceCommandHandler : IAsyncCommandHandler<AddDeviceCommand>
{
    private readonly UpnpDbContext context;

    public AddDeviceCommandHandler(UpnpDbContext context) => this.context = context;

    public Task ExecuteAsync(AddDeviceCommand command, CancellationToken cancellationToken)
    {
        context.Add(command.Device);

        return context.SaveChangesAsync(cancellationToken);
    }
}