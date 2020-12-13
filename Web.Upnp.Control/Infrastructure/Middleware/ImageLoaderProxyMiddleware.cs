using Microsoft.Extensions.Logging;
using Web.Upnp.Control.Infrastructure.HttpClients;

namespace Web.Upnp.Control.Infrastructure.Middleware
{
    public class ImageLoaderProxyMiddleware : ProxyMiddleware
    {
        public ImageLoaderProxyMiddleware(ImageLoaderProxyClient client, ILogger<ProxyMiddleware> logger) : base(client.Client, logger)
        {
        }
    }
}