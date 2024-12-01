using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using IoT.Protocol.Upnp;
using OOs.Net.Sockets;
using OOs.Policies;
using static OOs.Net.NetworkInterfaceExtensions;

namespace Upnp.Control.Infrastructure.UpnpDiscovery.Configuration;

public static partial class ConfigureServicesExtensions
{
    public static IServiceCollection AddUpnpDiscovery(this IServiceCollection services) =>
        services
            .ConfigureSsdpOptions()
            .AddHostedService<UpnpDiscoveryService>()
            .AddTransient<IUpnpServiceMetadataProvider, UpnpServiceMetadataProvider>()
            .AddTransient<IAsyncEnumerable<SsdpReply>>(sp => SsdpEnumeratorFactory(sp));

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(SsdpOptions))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static IServiceCollection ConfigureSsdpOptions(this IServiceCollection services)
    {
        services.AddTransient<IValidateOptions<SsdpOptions>, SsdpOptionsValidator>();
        services.AddOptions<SsdpOptions>().BindConfiguration("SSDP");
        return services;
    }

    private static SsdpSearchEnumerator SsdpEnumeratorFactory(IServiceProvider serviceProvider)
    {
        var options = serviceProvider.GetRequiredService<IOptions<SsdpOptions>>().Value;
        var logger = serviceProvider.GetRequiredService<ILogger<UpnpDiscoveryService>>();

        return new SsdpSearchEnumerator(
            searchTarget: UpnpServices.RootDevice,
            groupEndPoint: options.ForceIPv6 ? SocketBuilderExtensions.GetIPv6SSDPGroup() : SocketBuilderExtensions.GetIPv4SSDPGroup(),
            userAgent: null,
            configureSocket: (socket, groupEndPoint) =>
            {
                var mcintAddress = (options.MulticastInterface switch
                {
                    "auto" => FindBestMulticastInterface(),
                    "any" => null,
                    var name => FindInterface(name)
                })?.GetPrimaryAddress(socket.AddressFamily);

                socket.ConfigureMulticastOptions(mcintAddress, options.MulticastTTL).JoinMulticastGroup(groupEndPoint, mcintAddress);

                // Query MulticastInterface option from the configured socket directly to get effectively applied value
                var isIPv4 = socket.AddressFamily is AddressFamily.InterNetwork;
                var mcint = (uint)(int)socket.GetSocketOption(isIPv4 ? SocketOptionLevel.IP : SocketOptionLevel.IPv6, SocketOptionName.MulticastInterface);
                mcintAddress = isIPv4
                    ? new IPAddress(mcint)
                    : NetworkInterface.GetAllNetworkInterfaces()
                        .Select(iface => iface.GetIPProperties())
                        .First(ipp => ipp.GetIPv6Properties().Index == mcint).UnicastAddresses
                            .First(ua => ua.Address.AddressFamily is AddressFamily.InterNetworkV6).Address;

                LogMulticastConfiguration(logger, groupEndPoint, mcintAddress);
            },
            searchRepeatPolicy: new RepeatPolicyBuilder()
                .WithExponentialInterval(2, options.SearchIntervalSeconds)
                .WithJitter(500, 1000)
                .Build());
    }

    private static NetworkInterface FindInterface(string nameOrIdOrAddress)
    {
        var mcastInterface = FindByName(nameOrIdOrAddress) ??
            FindByAddress(nameOrIdOrAddress) ??
            FindById(nameOrIdOrAddress) ??
            throw new ArgumentException("Requested interface was not found");

        if (!mcastInterface.SupportsMulticast)
        {
            throw new ArgumentException("Requested interface doesn't support multicast");
        }

        if (mcastInterface.OperationalStatus != OperationalStatus.Up)
        {
            throw new ArgumentException("Requested interface is not in operational state");
        }

        return mcastInterface;
    }

    [LoggerMessage(LogLevel.Information, "Joined '{groupEndPoint}' multicast group on '{mcintAddress}' interface for SSDP discovery")]
    private static partial void LogMulticastConfiguration(ILogger logger, IPEndPoint groupEndPoint, IPAddress mcintAddress);
}