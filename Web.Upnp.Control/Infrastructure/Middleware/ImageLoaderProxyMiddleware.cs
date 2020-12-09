using Web.Upnp.Control.Infrastructure.HttpClients;

namespace Web.Upnp.Control.Infrastructure.Middleware
{
    public class ImageLoaderProxyMiddleware : ProxyMiddleware
    {
        public ImageLoaderProxyMiddleware(ImageLoaderProxyClient client) : base(client.Client)
        {
        }
    }
}