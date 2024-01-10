using System.Diagnostics.CodeAnalysis;
using IoT.Protocol.Upnp;
using OOs.Net.Sockets;
using OOs.Policies;

namespace Upnp.Control.Infrastructure.UpnpDiscovery.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddUpnpDiscovery(this IServiceCollection services, Action<OptionsBuilder<SsdpOptions>> configure = null) =>
        services
            .ConfigureSsdpOptions(configure)
            .AddHostedService<UpnpDiscoveryService>()
            .AddTransient<IUpnpServiceMetadataProvider, UpnpServiceMetadataProvider>()
            .AddTransient<IAsyncEnumerable<SsdpReply>>(sp => SsdpEnumeratorFactory(sp));

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(SsdpOptions))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static IServiceCollection ConfigureSsdpOptions(this IServiceCollection services, Action<OptionsBuilder<SsdpOptions>> configure = null)
    {
        var builder = services.AddOptions<SsdpOptions>().BindConfiguration("SSDP");
        configure?.Invoke(builder);
        return services;
    }

    private static SsdpSearchEnumerator SsdpEnumeratorFactory(IServiceProvider serviceProvider)
    {
        var options = serviceProvider.GetRequiredService<IOptions<SsdpOptions>>().Value;

        return new SsdpSearchEnumerator(UpnpServices.RootDevice,
            (socket, ep) => socket
                .ConfigureMulticast(options.MulticastInterfaceIndex, options.MulticastTTL)
                .JoinMulticastGroup(ep),
            new RepeatPolicyBuilder()
                .WithExponentialInterval(2, options.SearchIntervalSeconds)
                .WithJitter(500, 1000)
                .Build());
    }
}