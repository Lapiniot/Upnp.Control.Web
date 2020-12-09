using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Infrastructure.HttpClients
{
    public class EventSubscribeClient : IEventSubscribeClient
    {
        private readonly HttpClient client;
        private readonly IServerAddressesFeature serverAddresses;
        private Uri bindingAddress;

        public EventSubscribeClient(HttpClient client, IServer server)
        {
            serverAddresses = (server ?? throw new ArgumentNullException(nameof(server))).Features.Get<IServerAddressesFeature>();
            this.client = client ?? throw new ArgumentNullException(nameof(client));
        }

        public async Task<(string Sid, int Timeout)> SubscribeAsync(Uri subscribeUri, Uri deliveryUri, TimeSpan timeout, CancellationToken cancellationToken = default)
        {
            if(!deliveryUri.IsAbsoluteUri)
            {
                deliveryUri = new Uri(bindingAddress ??= HostingExtensions.ResolveExternalBindingAddress(serverAddresses.Addresses), deliveryUri);
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