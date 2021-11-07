using System.Globalization;
using IoT.Device.Upnp.Umi.Services;
using Upnp.Control.Models;
using Upnp.Control.Services;

namespace Web.Upnp.Control.Services.Commands;

public sealed class QueueClearCommandHandler : IAsyncCommandHandler<QClearCommand>
{
    private readonly IUpnpServiceFactory factory;

    public QueueClearCommandHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task ExecuteAsync(QClearCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var service = await factory.GetServiceAsync<QueueService>(command.DeviceId, cancellationToken).ConfigureAwait(false);
        var result = await service.RemoveAllAsync(0, command.QueueId, 0, cancellationToken).ConfigureAwait(false);
        await service.RemoveAllAsync(0, command.QueueId, uint.Parse(result["NewUpdateID"], CultureInfo.InvariantCulture), cancellationToken).ConfigureAwait(false);
    }
}