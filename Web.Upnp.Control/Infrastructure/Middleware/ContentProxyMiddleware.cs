using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using static System.StringComparison;

namespace Web.Upnp.Control.Infrastructure.Middleware
{
    public sealed class ContentProxyMiddleware : ProxyMiddleware
    {
        private const string OptionChunked = "chunked";
        private const string OptionNoLength = "no-length";
        private const string OptionStipIcyMetadata = "strip-icy-metadata";
        private const string OptionAddDlnaMetadata = "add-dlna-metadata";

        public ContentProxyMiddleware(HttpClient client) : base(client)
        {
            BufferSize = 4 * 1024;
        }

        protected override void CopyHeaders(HttpResponseMessage responseMessage, HttpContext context)
        {
            base.CopyHeaders(responseMessage, context);

            if(responseMessage.StatusCode >= HttpStatusCode.BadRequest) return;

            if(HasOptionEnabled(context, OptionNoLength))
            {
                context.Response.ContentLength = null;
                context.Response.Headers["Transfer-Encoding"] = "identity";
            }

            if(HasOptionEnabled(context, OptionChunked))
            {
                context.Response.ContentLength = null;
                context.Response.Headers["Transfer-Encoding"] = "chunked";
            }

            if(HasOptionEnabled(context, OptionStipIcyMetadata))
            {
                foreach(var (header, _) in responseMessage.Headers)
                {
                    if(header.StartsWith("Icy-", InvariantCultureIgnoreCase))
                    {
                        context.Response.Headers.Remove(header);
                    }
                }
            }

            if(HasOptionEnabled(context, OptionAddDlnaMetadata))
            {
                var headers = context.Response.Headers;
                headers.Add("Accept-Ranges", "none");
                headers.Add("transferMode.dlna.org", "Streaming");
                headers.Add("realTimeInfo.dlna.org", "DLNA.ORG_TLAG=*");
                headers.Add("contentFeatures.dlna.org", "DLNA.ORG_OP=00;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000");
            }
        }

        protected override async Task CopyContentAsync(HttpResponseMessage responseMessage, HttpContext context, CancellationToken cancellationToken)
        {
            var httpResponseBodyFeature = context.Features.Get<IHttpResponseBodyFeature>();
            httpResponseBodyFeature?.DisableBuffering();

            using(var stream = await responseMessage.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false))
            {
                var writer = context.Response.BodyWriter;

                // prebuffer some content from the source stream into the writer's memory before starting actual response to the client
                await PreBufferContentAsync(stream, writer, 16 * BufferSize, cancellationToken).ConfigureAwait(false);

                // start providing response and flush headers to the client
                await context.Response.StartAsync(cancellationToken);

                // flush prebuffered data to the client
                await writer.FlushAsync(cancellationToken);

                // continue to transfer content from source stream in a normal way (read 
                // available bytes up to BufferSize and flush to client immidiately)
                await CopyContentAsync(stream, writer, cancellationToken).ConfigureAwait(false);
            }
        }

        private static bool HasOptionEnabled(HttpContext context, string name)
        {
            return context.Request.Query.TryGetValue(name, out var v) && (v == string.Empty || v == "1" || v == "true");
        }
    }
}