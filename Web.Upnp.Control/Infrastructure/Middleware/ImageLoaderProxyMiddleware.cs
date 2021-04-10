using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Net.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Infrastructure.HttpClients;

namespace Web.Upnp.Control.Infrastructure.Middleware
{
    [SuppressMessage("Microsoft.Design", "CA1812: Avoid uninstantiated internal classes", Justification = "Instantiated by infrastructure")]
    internal sealed class ImageLoaderProxyMiddleware : ProxyMiddleware
    {
        private readonly IOptions<ImageProxyOptions> options;

        public ImageLoaderProxyMiddleware(ImageLoaderProxyClient client, IOptions<ImageProxyOptions> options, ILogger<ProxyMiddleware> logger) : base(client.Client, logger)
        {
            this.options = options ?? throw new System.ArgumentNullException(nameof(options));
            this.BufferSize = options.Value.BufferSize;
        }

        protected override void CopyHeaders(HttpResponseMessage responseMessage, HttpContext context)
        {
            if(!responseMessage.Content.Headers.ContentType.MediaType.StartsWith("image/", System.StringComparison.InvariantCulture))
            {
                throw new InvalidDataException("Invalid data. Content of type image/* was expected.");
            }

            base.CopyHeaders(responseMessage, context);

            if(options.Value.CacheControl is { Length: > 0 } cacheControl)
            {
                context.Response.Headers[HeaderNames.CacheControl] = cacheControl;
            }

            if(options.Value.VaryBy is { Length: > 0 } varyBy)
            {
                context.Response.Headers[HeaderNames.Vary] = varyBy;
            }
        }
    }
}