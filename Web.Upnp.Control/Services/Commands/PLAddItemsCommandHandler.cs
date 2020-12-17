using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Web.Upnp.Control.Infrastructure;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static IoT.Protocol.Upnp.Services.BrowseMode;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLAddItemsCommandHandler : PLCommandBase, IAsyncCommandHandler<PLAddItemsCommand>
    {
        private const string XmlnsNamespace = "http://www.w3.org/2000/xmlns/";
        private const string DIDLLiteNamespace = "urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/";
        private const string DCNamespace = "http://purl.org/dc/elements/1.1/";
        private const string UPNPNamespace = "urn:schemas-upnp-org:metadata-1-0/upnp/";
        private const string DLNANamespace = "urn:schemas-dlna-org:metadata-1-0/";
        private const string MissingArgumentErrorFormat = "{0} must be provided";
        private readonly IHttpClientFactory httpClientFactory;
        private readonly IServerAddressesFeature serverAddresses;

        public PLAddItemsCommandHandler(IUpnpServiceFactory factory, IHttpClientFactory httpClientFactory, IServer server) : base(factory)
        {
            this.httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
            this.serverAddresses = server.Features.Get<IServerAddressesFeature>() ??
                throw new InvalidOperationException("Get server addresses feature is not available");
        }

        public Task ExecuteAsync(PLAddItemsCommand command, CancellationToken cancellationToken)
        {
            return command switch
            {
                { DeviceId: null or "" } => throw new ArgumentException(string.Format(MissingArgumentErrorFormat, nameof(PLAddItemsCommand.DeviceId))),
                { PlaylistId: null or "" } => throw new ArgumentException(string.Format(MissingArgumentErrorFormat, nameof(PLAddItemsCommand.PlaylistId))),
                { Source: { MediaUrl: { } url, Title: var title, UseProxy: var useProxy }, DeviceId: var deviceId, PlaylistId: var playlistId } =>
                    AddUrlAsync(deviceId, playlistId, url, title, useProxy, cancellationToken),
                { Source: { DeviceId: { } source, Items: { } ids }, DeviceId: var deviceId, PlaylistId: var playlistId } =>
                    AddItemsAsync(deviceId, playlistId, source, ids, cancellationToken),
                _ => throw new ArgumentException("Either source deviceId or mediaUrl must be provided")
            };
        }

        private async Task AddUrlAsync(string deviceId, string playlistId, string mediaUrl, string title, bool? useProxy, CancellationToken cancellationToken)
        {
            var playlistService = await Factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var targetCDService = await Factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            var updateId = await GetUpdateIdAsync(targetCDService, playlistId, cancellationToken).ConfigureAwait(false);

            var client = httpClientFactory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Get, mediaUrl);
            using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken).ConfigureAwait(false);

            var length = response.Content.Headers.ContentLength;
            var contentType = response.Content.Headers.ContentType;
            int? br = response.Headers.TryGetValues("icy-br", out var values) && int.TryParse(values.First(), out var v) ? v * 128 : null;
            var name = response.Headers.TryGetValues("icy-name", out values) ? values.First() : null;
            var description = response.Headers.TryGetValues("icy-description", out values) ? values.First() : null;
            var genre = response.Headers.TryGetValues("icy-genre", out values) ? values.First() : null;

            var url = useProxy != true ? mediaUrl
                : new UriBuilder(HostingExtensions.ResolveExternalBindingAddress(serverAddresses.Addresses))
                {
                    Path = $"/dlna-proxy/{Uri.EscapeUriString(mediaUrl)}",
                    Query = "?no-length&strip-icy-metadata&add-dlna-metadata"
                }.Uri.AbsoluteUri;

            var sb = new StringBuilder();
            using var writer = XmlWriter.Create(sb, new XmlWriterSettings() { OmitXmlDeclaration = true });
            writer.WriteStartElement("DIDL-Lite", DIDLLiteNamespace);
            writer.WriteAttributeString("dc", XmlnsNamespace, DCNamespace);
            writer.WriteAttributeString("upnp", XmlnsNamespace, UPNPNamespace);
            writer.WriteAttributeString("dlna", XmlnsNamespace, DLNANamespace);
            writer.WriteStartElement("item");
            writer.WriteElementString("title", DCNamespace, !string.IsNullOrEmpty(title) ? title : (name ?? "Unknown"));
            if(!string.IsNullOrEmpty(description)) writer.WriteElementString("description", DCNamespace, description);
            if(!string.IsNullOrEmpty(genre)) writer.WriteElementString("genre", UPNPNamespace, genre);
            writer.WriteElementString("class", UPNPNamespace, "object.item.audioItem.musicTrack");
            writer.WriteStartElement("res");
            if(length is not null) writer.WriteAttributeString("size", length.Value.ToString(CultureInfo.InvariantCulture));
            if(br is not null) writer.WriteAttributeString("bitrate", br.Value.ToString(CultureInfo.InvariantCulture));
            writer.WriteAttributeString("protocolInfo", $"http-get:*:{(contentType?.MediaType ?? "audio/mpegurl")}:*");
            writer.WriteValue(url);
            writer.WriteEndDocument();
            writer.Flush();

            await playlistService.AddUriAsync(0, playlistId, updateId, mediaUrl, sb.ToString(), cancellationToken: cancellationToken).ConfigureAwait(false);
        }

        private async Task AddItemsAsync(string deviceId, string playlistId, string sourceDeviceId, IEnumerable<string> sourceItems, CancellationToken cancellationToken)
        {
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