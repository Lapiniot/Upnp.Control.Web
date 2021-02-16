using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Infrastructure.HttpClients
{
    public class EventSubscribeClient : IEventSubscribeClient
    {
        private readonly HttpClient client;

        public EventSubscribeClient(HttpClient client)
        {
            this.client = client ?? throw new ArgumentNullException(nameof(client));
        }

        public async Task<(string Sid, int Timeout)> SubscribeAsync(Uri subscribeUri, Uri deliveryUri, TimeSpan timeout, CancellationToken cancellationToken = default)
        {
            if(!deliveryUri.IsAbsoluteUri)
            {
                throw new ArgumentException("Only absolute uri is acceptable");
            }

            using var request = new HttpRequestMessage(new HttpMethod("SUBSCRIBE"), subscribeUri)
            {
                Headers = {{"NT", "upnp:event"}, {"CALLBACK", $"<{deliveryUri.AbsoluteUri}>"}, {"TIMEOUT", $"Second-{timeout.TotalSeconds}"}}
            };

            using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();

            return (response.Headers.GetValues("SID").First(), int.Parse(response.Headers.GetValues("TIMEOUT").Single()[7..]));
        }

        public async Task<(string Sid, int Timeout)> RenewAsync(Uri subscribeUri, string sid, TimeSpan timeout, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(new HttpMethod("SUBSCRIBE"), subscribeUri)
            {
                Headers = {{"SID", sid}, {"TIMEOUT", $"Second-{timeout.TotalSeconds}"}}
            };

            using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();

            return (response.Headers.GetValues("SID").First(), int.Parse(response.Headers.GetValues("TIMEOUT").Single()[7..]));
        }

        public async Task UnsubscribeAsync(Uri subscribeUri, string sid, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(new HttpMethod("UNSUBSCRIBE"), subscribeUri)
            {
                Headers = {{"SID", sid}}
            };

            using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();
        }
    }
}