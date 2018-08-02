using System.Net.Http;

namespace Web.Upnp.Control.Services.HttpClients
{
    public class HttpSoapClient
    {
        public HttpSoapClient(HttpClient client)
        {
            Client = client;
            client.DefaultRequestHeaders.Add("Accept-Encoding", "gzip,deflate");
        }

        public HttpClient Client { get; }
    }
}