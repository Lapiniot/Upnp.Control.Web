using System;
using System.Net.Http;

namespace Web.Upnp.Control.Infrastructure.HttpClients
{
    public class HttpSoapClient
    {
        public HttpSoapClient(HttpClient client)
        {
            Client = client ?? throw new ArgumentNullException(nameof(client));
            Client.DefaultRequestHeaders.Add("Accept-Encoding", "gzip,deflate");
            Client.DefaultRequestVersion = new Version(1, 1);
        }

        public HttpClient Client { get; }
    }
}