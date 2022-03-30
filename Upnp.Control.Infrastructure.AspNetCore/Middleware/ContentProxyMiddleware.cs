using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Net.Http.Headers;

using static System.StringComparison;

namespace Upnp.Control.Infrastructure.AspNetCore.Middleware;

public sealed class ContentProxyMiddleware : ProxyMiddleware
{
    private const string OptionChunked = "chunked";
    private const string OptionNoLength = "no-length";
    private const string OptionStripIcyMetadata = "strip-icy-metadata";
    private const string OptionAddDlnaMetadata = "add-dlna-metadata";

    public ContentProxyMiddleware(HttpClient client, [NotNull] IOptions<Configuration.ContentProxyOptions> options, ILogger<ContentProxyMiddleware> logger) :
        base(client, logger) => BufferSize = options.Value.BufferSize;

    protected override HttpRequestMessage CreateRequestMessage([NotNull] HttpContext context, Uri requestUri, HttpMethod method)
    {
        return new HttpRequestMessage(context.Request.Method == "HEAD" ? HttpMethod.Head : HttpMethod.Get, requestUri)
        {
            Headers =
                {
                    CacheControl = new CacheControlHeaderValue() { NoCache = true, NoStore = true },
                    ConnectionClose = true,
                    UserAgent = { new ProductInfoHeaderValue("Mozilla", "5.0"), new ProductInfoHeaderValue("UPnP-Controller-DLNA-Proxy", "1.0") }
                }
        };
    }

    protected override void CopyHeaders([NotNull] HttpResponseMessage responseMessage, [NotNull] HttpContext context)
    {
        base.CopyHeaders(responseMessage, context);

        context.Response.Headers.Remove("Expires");
        context.Response.Headers["Server"] = "UPnP Controller DLNA Proxy";
        context.Response.Headers["Pragma"] = "no-cache";
        context.Response.Headers["Cache-Control"] = "no-cache";
        context.Response.Headers["Date"] = DateTimeOffset.UtcNow.ToString("r");

        if (responseMessage.StatusCode >= HttpStatusCode.BadRequest) return;

        if (HasOptionEnabled(context, OptionNoLength))
        {
            context.Response.ContentLength = null;
            context.Response.Headers["Transfer-Encoding"] = "identity";
        }

        if (HasOptionEnabled(context, OptionChunked))
        {
            context.Response.ContentLength = null;
            context.Response.Headers["Transfer-Encoding"] = "chunked";
        }

        if (HasOptionEnabled(context, OptionStripIcyMetadata))
        {
            foreach (var (header, _) in responseMessage.Headers)
            {
                if (header.StartsWith("Icy-", InvariantCultureIgnoreCase))
                {
                    context.Response.Headers.Remove(header);
                }
            }
        }

        if (HasOptionEnabled(context, OptionAddDlnaMetadata))
        {
            var headers = context.Response.Headers;
            headers.Add("Accept-Ranges", "none");
            headers.Add("transferMode.dlna.org", "Streaming");
            headers.Add("realTimeInfo.dlna.org", "DLNA.ORG_TLAG=*");
            headers.Add("contentFeatures.dlna.org", "*");
            //headers.Add("contentFeatures.dlna.org", "DLNA.ORG_OP=00;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000");
        }
    }
    protected override Task CopyContentAsync([NotNull] HttpResponseMessage responseMessage, [NotNull] HttpContext context, CancellationToken cancellationToken)
    {
        context.Features.Get<IHttpResponseBodyFeature>()?.DisableBuffering();
        return base.CopyContentAsync(responseMessage, context, cancellationToken);
    }

    private static bool HasOptionEnabled(HttpContext context, string name) =>
        context.Request.Query.TryGetValue(name, out var v) && (v == string.Empty || v == "1" || v == "true");
}