using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLAddItemsCommandHandler : PLCommandBase, IAsyncCommandHandler<PLAddItemsCommand>
    {
        private readonly IOptionsSnapshot<PlaylistOptions> options;

        public PLAddItemsCommandHandler(IUpnpServiceFactory factory, IOptionsSnapshot<PlaylistOptions> options) : base(factory)
        {
            this.options = options ?? throw new ArgumentNullException(nameof(options));
        }

        public Task ExecuteAsync(PLAddItemsCommand command, CancellationToken cancellationToken)
        {
            return command switch
            {
                { DeviceId: null or "" } => throw new ArgumentException(string.Format(MissingArgumentErrorFormat, nameof(PLAddItemsCommand.DeviceId))),
                { PlaylistId: null or "" } => throw new ArgumentException(string.Format(MissingArgumentErrorFormat, nameof(PLAddItemsCommand.PlaylistId))),
                { Source: { DeviceId: { } source, Items: { } ids, MaxDepth: var depth }, DeviceId: var deviceId, PlaylistId: var playlistId } =>
                    AddItemsAsync(deviceId, playlistId, source, ids, depth, cancellationToken),
                _ => throw new ArgumentException("Valid source deviceId and item ids must be provided")
            };
        }

        private async Task AddItemsAsync(string deviceId, string playlistId, string sourceDeviceId, IEnumerable<string> items, int? maxDepth, CancellationToken cancellationToken)
        {
            var depth = maxDepth ?? options.Value.MaxContainerScanDepth;
            var sourceCDService = await GetServiceAsync<ContentDirectoryService>(sourceDeviceId, cancellationToken).ConfigureAwait(false);

            var sb = new StringBuilder();

            using(var writer = DIDLUtils.CreateDidlXmlWriter(sb))
            {
                await WriteItemsMetadataTreeAsync(sourceDeviceId, items, writer, depth, cancellationToken).ConfigureAwait(false);
            }

            await AddItemAsync(deviceId, playlistId, sb.ToString(), cancellationToken).ConfigureAwait(false);
        }
    }
}