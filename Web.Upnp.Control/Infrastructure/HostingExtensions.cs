using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;

using static System.Net.Sockets.AddressFamily;
using static System.Net.IPAddress;

namespace Web.Upnp.Control.Infrastructure;

public static class HostingExtensions
{
    private const string NoProtocolExternalEndpoint = "Server is not listening for specified protocol on external addresses";
    private const string NoActiveExternalAddress = "Cannot find external address on active interface for requested address family";

    public static Uri ResolveExternalBindingAddress(IEnumerable<string> serverAddresses, string protocol, AddressFamily family = InterNetwork)
    {
        var addresses = serverAddresses.Select(a =>
                Uri.TryCreate(a, UriKind.Absolute, out var uri) && IPEndPoint.TryParse(uri.Authority, out var ep) && !IsLoopback(ep.Address)
                    ? (Address: uri, Endpoint: ep)
                    : (uri, null))
            .Where(a => a.Endpoint != null && a.Address.Scheme == protocol)
            .ToArray();

        if(addresses.Length == 0) throw new InvalidOperationException(NoProtocolExternalEndpoint);

        var any = family == InterNetworkV6 ? IPv6Any : Any;

        // Check whether we have explicitely configured address (not IPAddress.Any) which matches protocol scheme and family
        if(addresses.FirstOrDefault(a => a.Endpoint.AddressFamily == family && !a.Endpoint.Address.Equals(any)) is { Address: { } match })
        {
            return match;
        }

        Func<(Uri Address, IPEndPoint Endpoint), bool> condition = family == InterNetworkV6 ?
            p => p.Address.Equals(IPv6Any) :
            p => true;

        // Or there should be at least IPAddress.IPv6Any specified if we want external endpoint for IPv6,
        // and IPv6Any|IPv4Any if we need IPv4 binding
        if(addresses.FirstOrDefault(condition) is not { Endpoint: { Port: var port }, Address: { Scheme: var scheme } })
        {
            throw new InvalidOperationException("Cannot find suitable listening address for callback URI");
        }

        var address = GetExternalIPAddress(family) ?? throw new InvalidOperationException(NoActiveExternalAddress);

        return new Uri($"{scheme}://{address}:{port}");
    }

    public static IPAddress GetExternalIPAddress(AddressFamily family)
    {
        var interfaces = NetworkInterface.GetAllNetworkInterfaces().GetActiveExternalInterfaces();
        return family == InterNetworkV6 ? interfaces.FindExternalIPv6Address() : interfaces.FindExternalIPv4Address();
    }
}