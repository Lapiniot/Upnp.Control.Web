using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;

namespace Web.Upnp.Control.Infrastructure
{
    public static class HostingExtensions
    {
        public static Uri ResolveExternalBindingAddress(IEnumerable<string> serverAddresses)
        {
            var addresses = serverAddresses.Select(a =>
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