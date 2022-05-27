using System.Net.NetworkInformation;

using static System.Net.NetworkInterfaceExtensions;

namespace Upnp.Control.Infrastructure.UpnpDiscovery.Configuration;

public class SsdpOptions
{
    private string mcastInterface = "auto";
    private int? mcastInterfaceIndex;

    public string MulticastInterface
    {
        get => mcastInterface;
        set
        {
            mcastInterface = value;
            mcastInterfaceIndex = GetInterfaceIndex(value);
        }
    }

    public int SearchIntervalSeconds { get; set; } = 60;

    public byte MulticastTTL { get; set; } = 1;

    private static int GetInterfaceIndex(string nameOrIdOrAddress)
    {
        var mcastInterface = (nameOrIdOrAddress is "any" or "auto"
            ? FindBestMulticastInterface()
            : FindByName(nameOrIdOrAddress) ?? FindByAddress(nameOrIdOrAddress) ?? FindById(nameOrIdOrAddress))
            ?? throw new ArgumentException("Requested interface was not found");

        if (!mcastInterface.SupportsMulticast)
        {
            throw new ArgumentException("Requested interface doesn't support multicast");
        }

        if (mcastInterface.OperationalStatus != OperationalStatus.Up)
        {
            throw new ArgumentException("Requested interface is not in operational state");
        }

        return mcastInterface.GetIPProperties().GetIPv4Properties().Index;
    }

    public int MulticastInterfaceIndex => mcastInterfaceIndex ??= GetInterfaceIndex(mcastInterface);
}