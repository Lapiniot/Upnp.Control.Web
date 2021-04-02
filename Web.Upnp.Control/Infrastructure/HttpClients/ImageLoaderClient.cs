using System.Net.Http;

namespace Web.Upnp.Control.Infrastructure.HttpClients
{
    public class ImageLoaderProxyClient
    {
        private readonly HttpClient client;

        public ImageLoaderProxyClient(HttpClient client)
        {
            this.client = client ?? throw new System.ArgumentNullException(nameof(client));
        }

        public HttpClient Client => client;
    }
}