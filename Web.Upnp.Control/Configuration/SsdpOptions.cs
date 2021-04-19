using System;
using static System.Net.NetworkInterfaceExtensions;

namespace Web.Upnp.Control.Configuration
{
    public record SsdpOptions
    {
        private string mcastInterface = "auto";
        private int? mcastInterfaceIndex;

        public string MulticastInterface
        {
            get { return mcastInterface; }
            init
            {
                mcastInterface = value;
                mcastInterfaceIndex = GetInterfaceIndex(value);
            }
        }

        public int SearchIntervalSeconds { get; init; } = 60;

        private static int GetInterfaceIndex(string name)
        {
            var mcastInterface = (name == "any" || name == "auto" ? FindBestMulticastInterface() : FindInterface(name))
                ?? throw new InvalidOperationException("Cannot find interface by name");

            var ipProps = mcastInterface.GetIPProperties();
            var ipv4props = ipProps.GetIPv4Properties();
            if(ipv4props is not null) return ipv4props.Index;
            var ipv6props = ipProps.GetIPv6Properties();
            if(ipv6props is not null) return ipv6props.Index;

            throw new InvalidOperationException("Cannot get interface index by interface name");
        }

        public int MulticastInterfaceIndex => (mcastInterfaceIndex ??= GetInterfaceIndex(mcastInterface));
    }
}