using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static IoT.Protocol.Upnp.Services.BrowseMode;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLAddItemsCommandHandler : PLCommandBase, IAsyncCommandHandler<PLAddItemsCommand>
    {
        public PLAddItemsCommandHandler(IUpnpServiceFactory factory) : base(factory) { }

        public Task ExecuteAsync(PLAddItemsCommand command, CancellationToken cancellationToken)
        {
            return command switch
            {
                { DeviceId: null or "" } => throw new ArgumentException(string.Format(MissingArgumentErrorFormat, nameof(PLAddItemsCommand.DeviceId))),
                { PlaylistId: null or "" } => throw new ArgumentException(string.Format(MissingArgumentErrorFormat, nameof(PLAddItemsCommand.PlaylistId))),
                { Source: { DeviceId: { } source, Items: { } ids }, DeviceId: var deviceId, PlaylistId: var playlistId } =>
                    AddItemsAsync(deviceId, playlistId, source, ids, cancellationToken),
                _ => throw new ArgumentException("Valid source deviceId and item ids must be provided")
            };
        }

        private async Task AddItemsAsync(string deviceId, string playlistId, string sourceDeviceId, IEnumerable<string> sourceItems, CancellationToken cancellationToken)
        {
            var sourceCDService = await GetServiceAsync<ContentDirectoryService>(sourceDeviceId).ConfigureAwait(false);

            var sb = new StringBuilder();

            using(var writer = CreateDidlXmlWriter(sb))
            {
                foreach(var item in sourceItems)
                {
                    var data = await sourceCDService.BrowseAsync(item, mode: BrowseMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);

                    using(var input = new StringReader(data["Result"]))
                    using(var reader = XmlReader.Create(input))
                    {
                        if(!reader.ReadToDescendant("DIDL-Lite") || reader.NamespaceURI != DIDLLiteNamespace) continue;
                        if(!reader.ReadToDescendant("item") || reader.NamespaceURI != DIDLLiteNamespace) continue;
                        writer.WriteNode(reader, true);
                    }
                }
            }

            await AddItemAsync(deviceId, playlistId, sb.ToString(), cancellationToken).ConfigureAwait(false);
        }
    }
}