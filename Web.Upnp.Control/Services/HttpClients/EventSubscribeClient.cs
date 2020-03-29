using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Web.Upnp.Control.Services.HttpClients
{
    public class EventSubscribeClient
    {
        private readonly HttpClient client;

        public EventSubscribeClient(HttpClient client)
        {
            this.client = client ?? throw new ArgumentNullException(nameof(client));
        }

        public async Task SubscribeAsync(Uri eventsUrl, Uri callbackUrl, TimeSpan timeout, CancellationToken cancellationToken = default)
        {
            using var request = new HttpRequestMessage(new HttpMethod("SUBSCRIBE"), eventsUrl)
            {
                Headers =
                {
                    { "CALLBACK", $"<{callbackUrl.AbsoluteUri}>" },
                    { "NT", "upnp:event" },
                    { "TIMEOUT", $"Second-{timeout.TotalSeconds}" }
                }
            };
            using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();
        }
    }
}