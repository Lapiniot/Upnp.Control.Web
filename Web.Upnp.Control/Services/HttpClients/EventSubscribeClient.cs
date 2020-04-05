using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;

namespace Web.Upnp.Control.Services.HttpClients
{
    public class EventSubscribeClient
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
                deliveryUri = new Uri(bindingAddress ??= ResolveExternalBindingAddress(), deliveryUri);
            }

            using var request = new HttpRequestMessage(new HttpMethod("SUBSCRIBE"), subscribeUri)
            {
                Headers = { { "NT", "upnp:event" }, { "CALLBACK", $"<{deliveryUri.AbsoluteUri}>" }, { "TIMEOUT", $"Second-{timeout.TotalSeconds}" } }
            };

            using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();

            return (response.Headers.GetValues("SID").First(), int.Parse(response.Headers.GetValues("TIMEOUT").Single()[7..]));
        }

        public async Task<(string Sid, int Timeout)> RenewAsync(Uri subscribeUri, string sid, TimeSpan timeout, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(new HttpMethod("SUBSCRIBE"), subscribeUri)
            {
                Headers = { { "SID", sid }, { "TIMEOUT", $"Second-{timeout.TotalSeconds}" } }
            };

            using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();

            return (response.Headers.GetValues("SID").First(), int.Parse(response.Headers.GetValues("TIMEOUT").Single()[7..]));
        }

        public async Task UnsubscribeAsync(Uri subscribeUri, string sid, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(new HttpMethod("UNSUBSCRIBE"), subscribeUri)
            {
                Headers = { { "SID", sid } }
            };

            using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();
        }

        private Uri ResolveExternalBindingAddress()
        {
            var addresses = serverAddresses.Addresses.Select(a =>
                    Uri.TryCreate(a, UriKind.Absolute, out var uri) && IPEndPoint.TryParse(uri.Authority, out var ep) && !IPAddress.IsLoopback(ep.Address)
                        ? (Address: uri, Endpoint: ep)
                        : (uri, null))
                .Where(a => a.Endpoint != null)
                .ToArray();

            if(addresses.Length == 0) throw new InvalidOperationException("Server is not listening on any of external interface addresses");

            var ipv4 = addresses.Where(a => a.Endpoint.AddressFamily == AddressFamily.InterNetwork).ToArray();

            if(ipv4.Length <= 0) throw new InvalidOperationException("Cannot find suitable IP address for callback URI");

            if(ipv4.FirstOrDefault(a => !a.Endpoint.Address.Equals(IPAddress.Any)) is { Address: { } address })
            {
                return address;
            }

            if(!(ipv4.FirstOrDefault(a => a.Endpoint.Address.Equals(IPAddress.Any)) is { Endpoint: { Port: var port }, Address: { Scheme: var scheme } }))
            {
                throw new InvalidOperationException("Cannot find suitable IP address for callback URI");
            }

            var ipv4Address = NetworkInterface.GetAllNetworkInterfaces().GetActiveExternalInterfaces().FindExternalIPv4Address();

            if(ipv4Address == null) throw new InvalidOperationException("Cannot find suitable IP address for callback URI");

            return new Uri($"{scheme}://{ipv4Address}:{port}");
        }
    }
}