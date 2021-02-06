using System;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class QueueClearCommandHandler : IAsyncCommandHandler<QClearCommand>
    {
        private readonly IUpnpServiceFactory factory;

        public QueueClearCommandHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(QClearCommand command, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<QueueService>(command.DeviceId).ConfigureAwait(false);
            var result = await service.RemoveAllAsync(0, command.QueueId, 0, cancellationToken).ConfigureAwait(false);
            await service.RemoveAllAsync(0, command.QueueId, uint.Parse(result["NewUpdateID"], CultureInfo.InvariantCulture), cancellationToken).ConfigureAwait(false);
        }
    }
}