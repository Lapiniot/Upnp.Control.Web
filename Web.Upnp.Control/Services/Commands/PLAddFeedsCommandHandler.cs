using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Pipelines;
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
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Infrastructure;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static Web.Upnp.Control.Infrastructure.HostingExtensions;

namespace Web.Upnp.Control.Services.Commands
{
    public sealed class PLAddFeedsCommandHandler : PLCommandBase,
        IAsyncCommandHandler<PLAddPlaylistFilesCommand>,
        IAsyncCommandHandler<PLAddFeedUrlCommand>
    {
        private readonly IServerAddressesFeature serverAddresses;
        private readonly IHttpClientFactory clientFactory;
        private readonly ILogger<PLAddFeedsCommandHandler> logger;
        private readonly IOptionsSnapshot<PlaylistOptions> options;

        public PLAddFeedsCommandHandler(IUpnpServiceFactory factory, IHttpClientFactory clientFactory,
            IServer server, ILogger<PLAddFeedsCommandHandler> logger, IOptionsSnapshot<PlaylistOptions> options) : base(factory)
        {
            this.clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            this.options = options ?? throw new ArgumentNullException(nameof(options));
            serverAddresses = server.Features.Get<IServerAddressesFeature>() ?? throw new InvalidOperationException("Get server addresses feature is not available");
        }

        #region Implementation of IAsyncCommandHandler<PLAddPlaylistFilesCommand>

        Task IAsyncCommandHandler<PLAddPlaylistFilesCommand>.ExecuteAsync(PLAddPlaylistFilesCommand command, CancellationToken cancellationToken)
        {
            return command switch
            {
                { DeviceId: null or "" } => throw new ArgumentException(string.Format(MissingArgumentErrorFormat, nameof(PLAddItemsCommand.DeviceId))),
                { PlaylistId: null or "" } => throw new ArgumentException(string.Format(MissingArgumentErrorFormat, nameof(PLAddItemsCommand.PlaylistId))),
                { DeviceId: { } deviceId, PlaylistId: { } playlistId, Source: { Files: { } files, UseProxy: var useProxy } } =>
                    AddFeedsAsync(deviceId, playlistId, files, useProxy, cancellationToken),
                _ => throw new ArgumentException("Valid source feed url must be provided")
            };
        }

        #endregion

        #region Implementation of IAsyncCommandHandler<PLAddFeedUrlCommand>

        Task IAsyncCommandHandler<PLAddFeedUrlCommand>.ExecuteAsync(PLAddFeedUrlCommand command, CancellationToken cancellationToken)
        {
            return command switch
            {
                { DeviceId: null or "" } => throw new ArgumentException(string.Format(MissingArgumentErrorFormat, nameof(PLAddItemsCommand.DeviceId))),
                { PlaylistId: null or "" } => throw new ArgumentException(string.Format(MissingArgumentErrorFormat, nameof(PLAddItemsCommand.PlaylistId))),
                { DeviceId: { } deviceId, PlaylistId: { } playlistId, Source: { Url: { } url, Title: var title, UseProxy: var useProxy } } =>
                    AddFeedUrlAsync(deviceId, playlistId, url, title, useProxy, cancellationToken),
                _ => throw new ArgumentException("Valid source feed url must be provided")
            };
        }

        #endregion

        private async Task AddFeedUrlAsync(string deviceId, string playlistId, Uri mediaUrl, string title, bool? useProxy, CancellationToken cancellationToken)
        {
            var sb = new StringBuilder();
            var client = clientFactory.CreateClient();
            using(var writer = CreateDidlXmlWriter(sb))
            {
                await AppendFeedItemAsyc(writer, client, mediaUrl, title, useProxy, cancellationToken).ConfigureAwait(false);
            }

            await AddUriMetadataAsync(deviceId, playlistId, sb.ToString(), cancellationToken).ConfigureAwait(false);
        }

        private async Task AddFeedsAsync(string deviceId, string playlistId, IEnumerable<IFormFile> files, bool? useProxy, CancellationToken cancellationToken)
        {
            var sb = new StringBuilder();
            var client = clientFactory.CreateClient();

            using(var writer = CreateDidlXmlWriter(sb))
            {
                foreach(var item in files)
                {
                    try
                    {
                        using var stream = item.OpenReadStream();
                        await using var reader = new StreamPipeReader(stream);
                        reader.Start();
                        var encoding = Path.GetExtension(item.FileName) == ".m3u8" ? Encoding.UTF8 : Encoding.GetEncoding(options.Value.DefaultEncoding);
                        await foreach(var (path, info, _) in new M3uParser(reader, encoding).ConfigureAwait(false).WithCancellation(cancellationToken))
                        {
                            await AppendFeedItemAsyc(writer, client, new Uri(path), info, useProxy, cancellationToken).ConfigureAwait(false);
                        }
                    }
                    catch(Exception exception)
                    {
                        logger.LogError(exception, "Error processing playlist file");
                    }
                }
            }

            await AddUriMetadataAsync(deviceId, playlistId, sb.ToString(), cancellationToken).ConfigureAwait(false);
        }

        private async Task AddUriMetadataAsync(string deviceId, string playlistId, string metadata, CancellationToken cancellationToken)
        {
            var playlistService = await Factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var targetCDService = await Factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            var updateId = await GetUpdateIdAsync(targetCDService, playlistId, cancellationToken).ConfigureAwait(false);
            await playlistService.AddUriAsync(0, playlistId, updateId, null, metadata, cancellationToken: cancellationToken).ConfigureAwait(false);
        }

        private async Task AppendFeedItemAsyc(XmlWriter writer, HttpClient client, Uri mediaUrl, string title, bool? useProxy, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, mediaUrl);
            using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken).ConfigureAwait(false);

            var length = response.Content.Headers.ContentLength;
            var contentType = response.Content.Headers.ContentType;
            int? br = response.Headers.TryGetValues("icy-br", out var values) && int.TryParse(values.First(), out var v) ? v * 128 : null;
            title = string.IsNullOrWhiteSpace(title) ? (response.Headers.TryGetValues("icy-name", out values) ? values.First() : mediaUrl.ToString()) : title;
            var description = response.Headers.TryGetValues("icy-description", out values) ? values.First() : null;
            var genre = response.Headers.TryGetValues("icy-genre", out values) ? values.First() : null;

            var url = useProxy != true ? mediaUrl
                : new UriBuilder(ResolveExternalBindingAddress(serverAddresses.Addresses))
                {
                    Path = $"/dlna-proxy/{Uri.EscapeUriString(mediaUrl.AbsoluteUri)}",
                    Query = "?no-length&strip-icy-metadata&add-dlna-metadata"
                }.Uri;

            WriteItem(writer, title, description, genre, url.AbsoluteUri, length, contentType?.MediaType, br);
        }
    }
}