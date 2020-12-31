using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Soap;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Services.Abstractions;
using static IoT.Protocol.Upnp.Services.BrowseMode;

namespace Web.Upnp.Control.Services.Commands
{
    public abstract class PLCommandBase
    {
        protected const string XmlnsNamespace = "http://www.w3.org/2000/xmlns/";
        protected const string DIDLLiteNamespace = "urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/";
        protected const string DCNamespace = "http://purl.org/dc/elements/1.1/";
        protected const string UPNPNamespace = "urn:schemas-upnp-org:metadata-1-0/upnp/";
        protected const string DLNANamespace = "urn:schemas-dlna-org:metadata-1-0/";
        protected const string MissingArgumentErrorFormat = "{0} must be provided";

        protected PLCommandBase(IUpnpServiceFactory serviceFactory)
        {
            this.serviceFactory = serviceFactory ?? throw new ArgumentNullException(nameof(serviceFactory));
        }

        private IUpnpServiceFactory serviceFactory { get; }

        protected Task<T> GetServiceAsync<T>(string deviceId) where T : SoapActionInvoker
        {
            return serviceFactory.GetServiceAsync<T>(deviceId);
        }

        protected async Task<int[]> GetItemIndices(string deviceId, string parentId, IEnumerable<string> ids, CancellationToken cancellationToken)
        {
            var service = await GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            return await GetItemIndices(service, parentId, ids, cancellationToken).ConfigureAwait(false);
        }

        protected async Task<string> GetUpdateIdAsync(string deviceId, string itemId, CancellationToken cancellationToken)
        {
            var service = await GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            return await GetUpdateIdAsync(service, itemId, cancellationToken).ConfigureAwait(false);
        }

        protected static async Task<int[]> GetItemIndices(ContentDirectoryService service, string parentId, IEnumerable<string> ids, CancellationToken cancellationToken)
        {
            var data = await service.BrowseAsync(parentId, count: uint.MaxValue, cancellationToken: cancellationToken).ConfigureAwait(false);
            var playlists = DIDLXmlParser.Parse(data["Result"], false, false);
            var map = playlists.Select((p, index) => (p.Id, index)).ToDictionary(p => p.Id, p => p.index + 1);
            return ids.Select(id => map[id]).ToArray();
        }

        protected static async Task<string> GetUpdateIdAsync(ContentDirectoryService service, string itemId, CancellationToken cancellationToken)
        {
            return (await service.BrowseAsync(itemId, mode: BrowseMetadata, filter: "id", cancellationToken: cancellationToken).ConfigureAwait(false))["UpdateID"];
        }

        protected static XmlWriter CreateDidlXmlWriter(StringBuilder sb)
        {
            var writer = XmlWriter.Create(sb, new XmlWriterSettings() { OmitXmlDeclaration = true, WriteEndDocumentOnClose = true });
            writer.WriteStartElement("DIDL-Lite", DIDLLiteNamespace);
            writer.WriteAttributeString("dc", XmlnsNamespace, DCNamespace);
            writer.WriteAttributeString("upnp", XmlnsNamespace, UPNPNamespace);
            writer.WriteAttributeString("dlna", XmlnsNamespace, DLNANamespace);
            return writer;
        }

        protected static void WriteItem(XmlWriter writer, string title, string description, string genre, Uri url, long? length, string contentType, int? br)
        {
            writer.WriteStartElement("item");
            writer.WriteElementString("title", DCNamespace, title);
            if(!string.IsNullOrEmpty(description)) writer.WriteElementString("description", DCNamespace, description);
            if(!string.IsNullOrEmpty(genre)) writer.WriteElementString("genre", UPNPNamespace, genre);
            writer.WriteElementString("class", UPNPNamespace, "object.item.audioItem.musicTrack");
            writer.WriteStartElement("res");
            if(length is not null) writer.WriteAttributeString("size", length.Value.ToString(CultureInfo.InvariantCulture));
            if(br is not null) writer.WriteAttributeString("bitrate", br.Value.ToString(CultureInfo.InvariantCulture));
            writer.WriteAttributeString("protocolInfo", $"http-get:*:{(contentType ?? "audio/mpegurl")}:*");
            writer.WriteValue(url.AbsoluteUri);
            writer.WriteEndElement();
            writer.WriteEndElement();
        }

        protected async Task CreatePlaylistAsync(string deviceId, string title, string contentMetadata, CancellationToken cancellationToken)
        {
            var service = await GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var result = await service.CreateAsync(title: title, cancellationToken: cancellationToken).ConfigureAwait(false);
            await service.AddUriAsync(objectId: result["AssignedObjectID"], enqueuedUriMetaData: contentMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);
        }

        protected async Task AddItemAsync(string deviceId, string playlistId, string metadata, CancellationToken cancellationToken)
        {
            var playlistService = await GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var targetCDService = await GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            var updateId = await GetUpdateIdAsync(targetCDService, playlistId, cancellationToken).ConfigureAwait(false);
            await playlistService.AddUriAsync(0, playlistId, updateId, null, metadata, cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}