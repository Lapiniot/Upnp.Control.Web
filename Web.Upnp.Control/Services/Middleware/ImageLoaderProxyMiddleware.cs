using Web.Upnp.Control.Services.HttpClients;

namespace Web.Upnp.Control.Services.Middleware
{
    public class ImageLoaderProxyMiddleware : ProxyMiddleware
    {
        public ImageLoaderProxyMiddleware(ImageLoaderProxyClient client) : base(client.Client)
        {
        }
    }
}