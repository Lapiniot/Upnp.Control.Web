using System.Diagnostics.CodeAnalysis;
using System.Net.Sockets;
using System.Policies;
using IoT.Protocol.Upnp;

namespace Upnp.Control.Infrastructure.UpnpDiscovery.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddUpnpDiscovery(this IServiceCollection services, Action<OptionsBuilder<SsdpOptions>> configure = null) =>
        services
            .ConfigureSsdpOptions(configure)
            .AddHostedService<UpnpDiscoveryService>()
            .AddTransient<IUpnpServiceMetadataProvider, UpnpServiceMetadataProvider>()
            .AddTransient(sp => SsdpEnumeratorFactory(sp));

    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode")]
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(SsdpOptions))]
    public static IServiceCollection ConfigureSsdpOptions(this IServiceCollection services, Action<OptionsBuilder<SsdpOptions>> configure = null)
    {
        var builder = services.AddOptions<SsdpOptions>().BindConfiguration("SSDP");
        configure?.Invoke(builder);
        return services;
    }

    private static IAsyncEnumerable<SsdpReply> SsdpEnumeratorFactory(IServiceProvider serviceProvider)
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