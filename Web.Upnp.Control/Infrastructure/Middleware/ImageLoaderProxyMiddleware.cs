using System.Net.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Infrastructure.HttpClients;

namespace Web.Upnp.Control.Infrastructure.Middleware
{
    public class ImageLoaderProxyMiddleware : ProxyMiddleware
    {
        private readonly IOptions<ImageProxyOptions> options;

        public ImageLoaderProxyMiddleware(ImageLoaderProxyClient client, IOptions<ImageProxyOptions> options, ILogger<ProxyMiddleware> logger) : base(client.Client, logger)
        {
            this.options = options ?? throw new System.ArgumentNullException(nameof(options));
            this.BufferSize = options.Value.BufferSize;
        }
        protected override void CopyHeaders(HttpResponseMessage responseMessage, HttpContext context)
        {
            base.CopyHeaders(responseMessage, context);

            if(options.Value.CacheControl is { Length: > 0 } cacheControl)
            {
                context.Response.Headers["Cache-Control"] = cacheControl;
            }
        }
    }
}