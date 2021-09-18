using System.Net.NetworkInformation;

using static System.Net.NetworkInterfaceExtensions;

namespace Web.Upnp.Control.Configuration;

public record SsdpOptions
{
    private string mcastInterface = "auto";
    private int? mcastInterfaceIndex;

    public string MulticastInterface
    {
        get => mcastInterface;
        init
        {
            mcastInterface = value;
            mcastInterfaceIndex = GetInterfaceIndex(value);
        }
    }

    public int SearchIntervalSeconds { get; init; } = 60;

    public byte MulticastTTL { get; init; } = 1;

    private static int GetInterfaceIndex(string nameOrIdOrAddress)
    {
        var mcastInterface = (nameOrIdOrAddress is "any" or "auto"
            ? FindBestMulticastInterface()
            : FindByName(nameOrIdOrAddress) ?? FindByAddress(nameOrIdOrAddress) ?? FindById(nameOrIdOrAddress))
            ?? throw new ArgumentException("Requested interface was not found");

        if(!mcastInterface.SupportsMulticast)
        {
            throw new ArgumentException("Requested interface doesn't support multicast");
        }

        if(mcastInterface.OperationalStatus != OperationalStatus.Up)
        {
            throw new ArgumentException("Requested interface is not in operational state");
        }

        var ipProps = mcastInterface.GetIPProperties();
        var ipv4props = ipProps.GetIPv4Properties();
        if(ipv4props is not null) return ipv4props.Index;
        var ipv6props = ipProps.GetIPv6Properties();
        return ipv6props is not null
            ? ipv6props.Index
            : throw new InvalidOperationException("Cannot get interface index by interface name");
    }

    public int MulticastInterfaceIndex => mcastInterfaceIndex ??= GetInterfaceIndex(mcastInterface);
}