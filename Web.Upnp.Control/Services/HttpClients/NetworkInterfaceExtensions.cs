using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;

namespace Web.Upnp.Control.Services.HttpClients
{
    public static class NetworkInterfaceExtensions
    {
        public static IEnumerable<NetworkInterface> GetActiveExternalInterfaces(this IEnumerable<NetworkInterface> interfaces)
        {
            return interfaces.Where(ni => ni.NetworkInterfaceType == NetworkInterfaceType.Ethernet &&
                            ni.OperationalStatus == OperationalStatus.Up && ni.GetIPProperties().GatewayAddresses.Any());
        }

        public static IPAddress FindExternalIPv4Address(this IEnumerable<NetworkInterface> interfaces)
        {
            return interfaces.FirstOrDefault(i => i.Supports(NetworkInterfaceComponent.IPv4))?
                .GetIPProperties().UnicastAddresses.FirstOrDefault(a => a.Address.AddressFamily == AddressFamily.InterNetwork).Address;
        }

        public static IPAddress FindExternalIPv6Address(this IEnumerable<NetworkInterface> interfaces)
        {
            return interfaces.FirstOrDefault(i => i.Supports(NetworkInterfaceComponent.IPv6))?
                .GetIPProperties().UnicastAddresses.FirstOrDefault(a => a.Address.AddressFamily == AddressFamily.InterNetworkV6).Address;
        }
    }
}