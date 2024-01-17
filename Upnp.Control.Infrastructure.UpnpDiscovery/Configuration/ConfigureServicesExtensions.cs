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

        return new SsdpSearchEnumerator(UpnpServices.RootDevice,
            (socket, groupEndPoint) =>
            {
                var mcintAddress = (options.MulticastInterface switch
                {
                    "auto" => FindBestMulticastInterface(),
                    "any" => null,
                    var name => FindInterface(name)
                })?.GetPrimaryAddress(socket.AddressFamily);

                socket.ConfigureMulticastOptions(mcintAddress, options.MulticastTTL).JoinMulticastGroup(groupEndPoint, mcintAddress);

                // Query MulticastInterface option from the configured socket directly to get effectively applied value
                var mcint = (int)socket.GetSocketOption(socket.AddressFamily is AddressFamily.InterNetwork ? SocketOptionLevel.IP : SocketOptionLevel.IPv6, SocketOptionName.MulticastInterface);
                LogMulticastConfiguration(logger, groupEndPoint, new IPAddress(mcint));
            },
            new RepeatPolicyBuilder()
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