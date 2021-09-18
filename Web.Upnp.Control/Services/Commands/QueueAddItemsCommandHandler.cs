using System.Globalization;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public sealed class QueueAddItemsCommandHandler : IAsyncCommandHandler<QAddItemsCommand>
    {
        private readonly IUpnpServiceFactory factory;
        private readonly IOptionsSnapshot<PlaylistOptions> options;

        public QueueAddItemsCommandHandler(IUpnpServiceFactory factory, IOptionsSnapshot<PlaylistOptions> options)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
            this.options = options ?? throw new ArgumentNullException(nameof(options));
        }

        public async Task ExecuteAsync(QAddItemsCommand command, CancellationToken cancellationToken)
        {
            if(command is null) throw new ArgumentNullException(nameof(command));
            var (deviceId, queueId, source) = command;

            var sourceCds = await factory.GetServiceAsync<ContentDirectoryService>(source.DeviceId, cancellationToken).ConfigureAwait(false);
            var (targetCds, queueService) = await factory.GetServicesAsync<ContentDirectoryService, QueueService>(deviceId, cancellationToken).ConfigureAwait(false);

            var sb = new System.Text.StringBuilder();
            using(var writer = DIDLUtils.CreateDidlXmlWriter(sb))
            {
                await UpnpUtils.WriteItemsMetadataTreeAsync(sourceCds, source.Items, writer, options.Value.MaxContainerScanDepth, cancellationToken).ConfigureAwait(false);
            }

            var updateId = await UpnpUtils.GetUpdateIdAsync(targetCds, queueId, cancellationToken).ConfigureAwait(false);

            await queueService.AddUriAsync(0, queueId, uint.Parse(updateId, CultureInfo.InvariantCulture), "", sb.ToString(), 1, false, cancellationToken).ConfigureAwait(false);
        }
    }
}