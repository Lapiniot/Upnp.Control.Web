using System;
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

        public Task<HttpResponseMessage> GetAsync(Uri originalUri, IHeaderDictionary originalHeaders, CancellationToken cancellationToken = default)
        {
            using var message = new HttpRequestMessage(HttpMethod.Get, originalUri);

            foreach(var (key, value) in originalHeaders)
            {
                if(key == "Host") continue;

                message.Headers.TryAddWithoutValidation(key, (IEnumerable<string>)value);
            }

            return client.SendAsync(message, cancellationToken);
        }
    }
}