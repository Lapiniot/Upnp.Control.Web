using System.Diagnostics.CodeAnalysis;
using System.Net.NetworkInformation;
using IoT.Protocol.Upnp;
using OOs.Net.Sockets;
using OOs.Policies;
using static OOs.Net.NetworkInterfaceExtensions;

namespace Upnp.Control.Infrastructure.UpnpDiscovery.Configuration;

public static class ConfigureServicesExtensions
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

        return new SsdpSearchEnumerator(UpnpServices.RootDevice,
            (socket, ep) => socket
                .ConfigureMulticast(GetInterfaceIndex(options.MulticastInterface), options.MulticastTTL)
                .JoinMulticastGroup(ep),
            new RepeatPolicyBuilder()
                .WithExponentialInterval(2, options.SearchIntervalSeconds)
                .WithJitter(500, 1000)
                .Build());
    }

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
}