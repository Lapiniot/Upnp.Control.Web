using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Web.Upnp.Control.Services.HttpClients
{
    public class ImageLoaderProxyClient
    {
        private readonly HttpClient client;

        public ImageLoaderProxyClient(HttpClient client)
        {
            this.client = client;
        }

        public Task<HttpResponseMessage> GetAsync(string originalUri, IHeaderDictionary originalHeaders, CancellationToken cancellationToken = default)
        {
            var message = new HttpRequestMessage(HttpMethod.Get, originalUri);

            foreach(var h in originalHeaders)
            {
                if(h.Key == "Host") continue;

                message.Headers.TryAddWithoutValidation(h.Key, (IEnumerable<string>)h.Value);
            }

            return client.SendAsync(message, cancellationToken);
        }
    }
}