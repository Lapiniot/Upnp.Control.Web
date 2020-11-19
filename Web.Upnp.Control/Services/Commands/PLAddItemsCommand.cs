using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static IoT.Protocol.Upnp.Services.BrowseMode;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLAddItemsCommand : PLCommandBase, IAsyncCommand<PLAddItemsParams>
    {
        private const string XmlnsNamespace = "http://www.w3.org/2000/xmlns/";
        private const string DIDLLiteNamespace = "urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/";
        private const string DCNamespace = "http://purl.org/dc/elements/1.1/";
        private const string UPNPNamespace = "urn:schemas-upnp-org:metadata-1-0/upnp/";
        private const string DLNANamespace = "urn:schemas-dlna-org:metadata-1-0/";

        public PLAddItemsCommand(IUpnpServiceFactory factory) : base(factory) { }

        public async Task ExecuteAsync(PLAddItemsParams commandParameters, CancellationToken cancellationToken)
        {
            var (deviceId, playlistId, sourceDeviceId, sourceItems) = commandParameters;
            var playlistService = await Factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var targetCDService = await Factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            var sourceCDService = await Factory.GetServiceAsync<ContentDirectoryService>(sourceDeviceId).ConfigureAwait(false);

            var sb = new StringBuilder();

            using(var writer = XmlWriter.Create(sb, new XmlWriterSettings() { OmitXmlDeclaration = true }))
            {
                writer.WriteStartElement("DIDL-Lite", DIDLLiteNamespace);
                writer.WriteAttributeString("dc", XmlnsNamespace, DCNamespace);
                writer.WriteAttributeString("upnp", XmlnsNamespace, UPNPNamespace);
                writer.WriteAttributeString("dlna", XmlnsNamespace, DLNANamespace);

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

                writer.WriteEndElement();
                writer.Flush();
            }

            var updateId = await GetUpdateIdAsync(targetCDService, playlistId, cancellationToken).ConfigureAwait(false);

            await playlistService.AddUriAsync(objectId: playlistId, updateId: updateId, enqueuedUriMetaData: sb.ToString(), cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}