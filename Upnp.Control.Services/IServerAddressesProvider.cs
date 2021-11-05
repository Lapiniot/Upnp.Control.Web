using System.Net.Sockets;

namespace Upnp.Control.Services;

public interface IServerAddressesProvider
{
    IEnumerable<string> GetServerAddresses();
    Uri ResolveExternalBindingAddress(string protocolScheme, AddressFamily addressFamily = AddressFamily.InterNetwork);
}