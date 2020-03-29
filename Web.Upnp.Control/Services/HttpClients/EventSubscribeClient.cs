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
        private readonly IServerAddressesFeature serverAddresses;
        private readonly HttpClient client;
        private Uri bindingAddress;

        public EventSubscribeClient(HttpClient client, IServer server)
        {
            serverAddresses = (server ?? throw new ArgumentNullException(nameof(server))).Features.Get<IServerAddressesFeature>();
            this.client = client ?? throw new ArgumentNullException(nameof(client));
            this.client.DefaultRequestHeaders.Add("NT", "upnp:event");
        }

        public async Task SubscribeAsync(Uri eventsUrl, Uri callbackUrl, TimeSpan timeout, CancellationToken cancellationToken = default)
        {
            if(!callbackUrl.IsAbsoluteUri)
            {
                callbackUrl = new Uri(bindingAddress ??= ResolveExternalBindingAddress(), callbackUrl);
            }

            using var request = new HttpRequestMessage(new HttpMethod("SUBSCRIBE"), eventsUrl)
            {
                Headers = { { "CALLBACK", $"<{callbackUrl.AbsoluteUri}>" }, { "TIMEOUT", $"Second-{timeout.TotalSeconds}" } }
            };

            using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();
        }

        private Uri ResolveExternalBindingAddress()
        {
            var addresses = serverAddresses.Addresses.Select(a =>
                                Uri.TryCreate(a, UriKind.Absolute, out var uri) &&
                                IPEndPoint.TryParse(uri.Authority, out var ep) &&
                                !IPAddress.IsLoopback(ep.Address) ? (Address: uri, Endpoint: ep) : (uri, null))
                            .Where(a => a.Endpoint != null)
                            .ToArray();

            if(addresses.Length == 0)
            {
                throw new InvalidOperationException("Server is not listening on any of external interface addresses");
            }

            var ipv4 = addresses.Where(a => a.Endpoint.AddressFamily == AddressFamily.InterNetwork).ToArray();

            if(ipv4.Length > 0)
            {
                if(ipv4.FirstOrDefault(a => !a.Endpoint.Address.Equals(IPAddress.Any)) is { Address: { } address })
                {
                    return address;
                }
                else if(ipv4.FirstOrDefault(a => a.Endpoint.Address.Equals(IPAddress.Any)) is { Endpoint: { Port: var port }, Address: { Scheme: var scheme } })
                {
                    var ipv4Address = NetworkInterface.GetAllNetworkInterfaces().GetActiveExternalInterfaces().FindExternalIPv4Address();
                    if(ipv4Address != null)
                    {
                        return new Uri($"{scheme}://{ipv4Address}:{port}");
                    }
                }
            }

            throw new InvalidOperationException("Cannot find suitable IP address for callback URI");
        }
    }
}