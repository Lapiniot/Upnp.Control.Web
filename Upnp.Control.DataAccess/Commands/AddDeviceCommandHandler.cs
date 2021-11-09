using Upnp.Control.Models;
using Upnp.Control.Services;

namespace Upnp.Control.DataAccess.Commands;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal class AddDeviceCommandHandler : IAsyncCommandHandler<AddDeviceCommand>
{
    private readonly UpnpDbContext context;

    public AddDeviceCommandHandler(UpnpDbContext context)
    {
        this.context = context;
    }

    public Task ExecuteAsync(AddDeviceCommand command, CancellationToken cancellationToken)
    {
        context.Add(command.Device);

        return context.SaveChangesAsync(cancellationToken);
    }
}