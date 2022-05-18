using System.Net;
using System.Net.Sockets;
using System.Net.NetworkInformation;

using static System.Net.Sockets.AddressFamily;
using static System.Net.IPAddress;

namespace Upnp.Control.Infrastructure.AspNetCore;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes: instantiated by DI container
internal sealed class ServerAddressesProvider : IServerAddressesProvider
{
    private readonly IServer server;

    public ServerAddressesProvider(IServer server) => this.server = server;

    public IEnumerable<string> GetServerAddresses() => server.Features.Get<IServerAddressesFeature>()?.Addresses ?? Array.Empty<string>();

    private const string NoProtocolExternalEndpoint = "Server is not listening for specified protocol on external addresses";
    private const string NoActiveExternalAddress = "Cannot find external address on active interface for requested address family";

    public Uri ResolveExternalBindingAddress(string protocol, AddressFamily addressFamily = InterNetwork)
    {
        var addresses = GetServerAddresses().Select(a =>
                Uri.TryCreate(a, UriKind.Absolute, out var uri) && IPEndPoint.TryParse(uri.Authority, out var ep) && !IsLoopback(ep.Address)
                    ? (Address: uri, Endpoint: ep)
                    : (uri, null))
            .Where(a => a.Endpoint != null && a.Address != null && a.Address.Scheme == protocol)
            .ToArray();

        if (addresses.Length == 0) throw new InvalidOperationException(NoProtocolExternalEndpoint);

        var any = addressFamily == InterNetworkV6 ? IPv6Any : Any;

        // Check whether we have explicitely configured address (not IPAddress.Any) which matches protocol scheme and family
        if (addresses.FirstOrDefault(a => a.Endpoint!.AddressFamily == addressFamily && !a.Endpoint.Address.Equals(any)) is { Address: { } match })
        {
            return match;
        }

        Func<(Uri Address, IPEndPoint Endpoint), bool> condition = addressFamily == InterNetworkV6 ?
            p => p.Address.Equals(IPv6Any) :
            p => true;

        // Or there should be at least IPAddress.IPv6Any specified if we want external endpoint for IPv6,
        // and IPv6Any|IPv4Any if we need IPv4 binding
        if (addresses!.FirstOrDefault(condition) is not { Endpoint.Port: var port, Address.Scheme: var scheme })
        {
            throw new InvalidOperationException("Cannot find suitable listening address for callback URI");
        }

        var address = GetExternalIPAddress(addressFamily) ?? throw new InvalidOperationException(NoActiveExternalAddress);

        return new Uri($"{scheme}://{address}:{port}");
    }

    public static IPAddress GetExternalIPAddress(AddressFamily family)
    {
        var interfaces = NetworkInterface.GetAllNetworkInterfaces().GetActiveExternalInterfaces();
        return family == InterNetworkV6 ? interfaces.FindExternalIPv6Address() : interfaces.FindExternalIPv4Address();
    }
}