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
using IoT.Protocol.Upnp.DIDL;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Infrastructure;
using Web.Upnp.Control.Services.Abstractions;
using static Web.Upnp.Control.Infrastructure.HostingExtensions;

namespace Web.Upnp.Control.Services.Commands
{
    public abstract class PLFeedsCommandBase : PLCommandBase
    {
        private readonly ILogger<PLFeedsCommandBase> logger;
        private readonly IHttpClientFactory httpClientFactory;
        private readonly IOptionsSnapshot<PlaylistOptions> options;
        private HttpClient client;

        protected PLFeedsCommandBase(IUpnpServiceFactory serviceFactory, IHttpClientFactory httpClientFactory,
            IServer server, IOptionsSnapshot<PlaylistOptions> options, ILogger<PLFeedsCommandBase> logger) : base(serviceFactory)
        {
            if(server is null) throw new ArgumentNullException(nameof(server));

            var serverAddresses = server.Features.Get<IServerAddressesFeature>() ?? throw new InvalidOperationException("Get server addresses feature is not available");
            BindingUri = ResolveExternalBindingAddress(serverAddresses.Addresses, "http");
            this.httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
            this.options = options ?? throw new ArgumentNullException(nameof(options));
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            client = httpClientFactory.CreateClient();
            client.Timeout = options.Value.FeedMetadataRequestTimeout;
        }

        public Uri BindingUri { get; }

        protected async Task AppendFromFileAsync(XmlWriter writer, IFormFile file, bool? useProxy, CancellationToken cancellationToken)
        {
            if(file is null) throw new ArgumentNullException(nameof(file));

            using var stream = file.OpenReadStream();
            await using var reader = new StreamPipeReader(stream);
            reader.Start();
            var encoding = Path.GetExtension(file.FileName) == ".m3u8" ? Encoding.UTF8 : Encoding.GetEncoding(options.Value.DefaultEncoding);
#pragma warning disable CA1508 // Looks like bug in the analyzer code
            await foreach(var (path, info, _) in new M3uParser(reader, encoding).ConfigureAwait(false).WithCancellation(cancellationToken))
#pragma warning restore CA1508 // Looks like bug in the analyzer code
            {
                await AppendFeedItemAsync(writer, new Uri(path), info, useProxy, cancellationToken).ConfigureAwait(false);
            }
        }

        protected async Task AppendFeedItemAsync(XmlWriter writer, Uri mediaUri, string title, bool? useProxy, CancellationToken cancellationToken)
        {
            if(mediaUri is null) throw new ArgumentNullException(nameof(mediaUri));

            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, mediaUri) { Headers = { { "Icy-MetaData", "1" } } };
                using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken).ConfigureAwait(false);
                response.EnsureSuccessStatusCode();
                var length = response.Content.Headers.ContentLength;
                var contentType = response.Content.Headers.ContentType;
                int? br = response.Headers.TryGetValues("icy-br", out var values) && int.TryParse(values.First(), out var v) ? v * 128 : null;
                title = string.IsNullOrWhiteSpace(title) ? (response.Headers.TryGetValues("icy-name", out values) ? values.First() : mediaUri.ToString()) : title;
                var description = response.Headers.TryGetValues("icy-description", out values) ? values.First() : null;
                var genre = response.Headers.TryGetValues("icy-genre", out values) ? values.First() : null;
                useProxy ??= response.Headers.TryGetValues("icy-metaint", out _);
                var url = useProxy != true ? mediaUri : GetProxyUri(mediaUri);

                DIDLUtils.WriteItem(writer, title, description, genre, url, length, contentType?.MediaType, br);
            }
            catch(HttpRequestException exception)
            {
                logger.LogWarning(exception, "Media feed test request failed");

                title = !string.IsNullOrWhiteSpace(title) ? title : mediaUri.ToString();
                var url = useProxy == false ? mediaUri : GetProxyUri(mediaUri);

                DIDLUtils.WriteItem(writer, title, null, null, url, null, null, null);
            }
        }

        private Uri GetProxyUri(Uri mediaUrl)
        {
            return new UriBuilder(BindingUri)
            {
                Path = $"/dlna-proxy/{Uri.EscapeDataString(mediaUrl.AbsoluteUri)}",
                Query = "?no-length&strip-icy-metadata&add-dlna-metadata"
            }.Uri;
        }

        protected async Task<string> GetMetadataAsync(IEnumerable<IFormFile> files, bool? useProxy, CancellationToken cancellationToken)
        {
            if(files is null) throw new ArgumentNullException(nameof(files));

            var sb = new StringBuilder();

            using(var writer = DIDLUtils.CreateDidlXmlWriter(sb))
            {
                foreach(var file in files)
                {
                    try
                    {
                        await AppendFromFileAsync(writer, file, useProxy, cancellationToken).ConfigureAwait(false);
                    }
                    catch(Exception exception)
                    {
                        logger.LogError(exception, $"Error processing playlist file '{file.FileName}'");
                        throw;
                    }
                }
            }

            return sb.ToString();
        }

        protected async Task AddFromUrlAsync(string deviceId, string playlistId, Uri mediaUrl, string title, bool? useProxy, CancellationToken cancellationToken)
        {
            var sb = new StringBuilder();

            using(var writer = DIDLUtils.CreateDidlXmlWriter(sb))
            {
                await AppendFeedItemAsync(writer, mediaUrl, title, useProxy, cancellationToken).ConfigureAwait(false);
            }

            await AddItemAsync(deviceId, playlistId, sb.ToString(), cancellationToken).ConfigureAwait(false);
        }

        protected async Task AddFromFilesAsync(string deviceId, string playlistId, IEnumerable<IFormFile> files, bool? useProxy, CancellationToken cancellationToken)
        {
            var metadata = await GetMetadataAsync(files, useProxy, cancellationToken).ConfigureAwait(false);
            await AddItemAsync(deviceId, playlistId, metadata, cancellationToken).ConfigureAwait(false);
        }

        protected async Task CreateFromFilesAsync(string deviceId, IEnumerable<IFormFile> files, string title, bool? useProxy, CancellationToken cancellationToken)
        {
            var metadata = await GetMetadataAsync(files, useProxy, cancellationToken).ConfigureAwait(false);
            await CreatePlaylistAsync(deviceId, title, metadata, cancellationToken).ConfigureAwait(false);
        }
    }
}