using System.IO.Pipelines;
using System.Text;
using System.Xml;

namespace Upnp.Control.Services.Commands;

internal abstract partial class PLFeedsCommandBase : PLCommandBase
{
    private readonly ILogger<PLFeedsCommandBase> logger;
    private readonly IOptionsSnapshot<Configuration.PlaylistOptions> options;
    private readonly HttpClient client;

    protected PLFeedsCommandBase(IUpnpServiceFactory serviceFactory, IHttpClientFactory httpClientFactory,
        IServerAddressesProvider serverAddressesProvider,
        IOptionsSnapshot<Configuration.PlaylistOptions> options,
        ILogger<PLFeedsCommandBase> logger) : base(serviceFactory)
    {
        ArgumentNullException.ThrowIfNull(serviceFactory);
        ArgumentNullException.ThrowIfNull(httpClientFactory);
        ArgumentNullException.ThrowIfNull(serverAddressesProvider);
        ArgumentNullException.ThrowIfNull(options);
        ArgumentNullException.ThrowIfNull(logger);

        this.options = options;
        this.logger = logger;

        BindingUri = serverAddressesProvider.ResolveExternalBindingAddress("http");
        client = httpClientFactory.CreateClient();
        client.Timeout = options.Value.FeedMetadataRequestTimeout;
    }

    public Uri BindingUri { get; }

    protected async Task AppendFromFileAsync(XmlWriter writer, FileSource file, bool? useProxy, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(file);

        using var stream = file.GetStream();

        var reader = new StreamPipeReader(stream);

        try
        {
            reader.Start();
            var encoding = Path.GetExtension(file.FileName) == ".m3u8" ? Encoding.UTF8 : Encoding.GetEncoding(options.Value.DefaultEncoding);
            await foreach(var (path, info, _) in new M3uParser(reader, encoding).ConfigureAwait(false).WithCancellation(cancellationToken))
            {
                await AppendFeedItemAsync(writer, new Uri(path), info, useProxy, cancellationToken).ConfigureAwait(false);
            }
        }
        finally
        {
            await reader.DisposeAsync().ConfigureAwait(false);
        }
    }

    protected async Task AppendFeedItemAsync(XmlWriter writer, Uri mediaUri, string title, bool? useProxy, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(mediaUri);

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, mediaUri) { Headers = { { "Icy-MetaData", "1" } } };
            using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();
            var length = response.Content.Headers.ContentLength;
            var contentType = response.Content.Headers.ContentType;
            int? br = response.Headers.TryGetValues("icy-br", out var values) && int.TryParse(values.First(), out var v) ? v * 128 : null;
            title = string.IsNullOrWhiteSpace(title) ? response.Headers.TryGetValues("icy-name", out values) ? values.First() : mediaUri.ToString() : title;
            var description = response.Headers.TryGetValues("icy-description", out values) ? values.First() : null;
            var genre = response.Headers.TryGetValues("icy-genre", out values) ? values.First() : null;
            useProxy ??= response.Headers.TryGetValues("icy-metaint", out _);
            var url = useProxy != true ? mediaUri : GetProxyUri(mediaUri);

            DIDLUtils.WriteItem(writer, title, description, genre, url, length, contentType?.MediaType, br);
        }
        catch(HttpRequestException exception)
        {
            LogFeedProbeRequestFailure(exception);

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

    protected async Task<string> GetMetadataAsync(IEnumerable<FileSource> files, bool? useProxy, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(files);

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
                    LogFileProcessingFailure(exception, file.FileName);
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

    protected async Task AddFromFilesAsync(string deviceId, string playlistId, IEnumerable<FileSource> files, bool? useProxy, CancellationToken cancellationToken)
    {
        var metadata = await GetMetadataAsync(files, useProxy, cancellationToken).ConfigureAwait(false);
        await AddItemAsync(deviceId, playlistId, metadata, cancellationToken).ConfigureAwait(false);
    }

    protected async Task CreateFromFilesAsync(string deviceId, IEnumerable<FileSource> files, string title, bool? useProxy, CancellationToken cancellationToken)
    {
        var metadata = await GetMetadataAsync(files, useProxy, cancellationToken).ConfigureAwait(false);
        await CreatePlaylistAsync(deviceId, title, metadata, cancellationToken).ConfigureAwait(false);
    }

    [LoggerMessage(1, LogLevel.Warning, "Media feed probing request failed")]
    private partial void LogFeedProbeRequestFailure(Exception exception);

    [LoggerMessage(2, LogLevel.Error, "Error processing playlist file '{filename}'")]
    private partial void LogFileProcessingFailure(Exception exception, string filename);
}