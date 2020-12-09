using System.Net.Http;

namespace Web.Upnp.Control.Services.HttpClients
{
    public class ImageLoaderProxyClient
    {
        private readonly HttpClient client;

        public ImageLoaderProxyClient(HttpClient client)
        {
            this.client = client;
        }

        public HttpClient Client => client;
    }
}