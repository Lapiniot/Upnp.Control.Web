using System;
using System.Net.Http;

namespace Web.Upnp.Control.Services.HttpClients
{
    public class HttpSoapClient
    {
        public HttpSoapClient(HttpClient client)
        {
            Client = client;
            client.DefaultRequestHeaders.Add("Accept-Encoding", "gzip,deflate");
            client.DefaultRequestVersion = new Version(1, 1);
        }

        public HttpClient Client { get; }
    }
}