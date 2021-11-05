namespace Upnp.Control.Infrastructure.UpnpDiscovery;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddUpnpDiscoveryService(this IServiceCollection services)
    {
        return services
            .AddHostedService<UpnpDiscoveryService>()
            .AddTransient<IUpnpServiceMetadataProvider, UpnpServiceMetadataProvider>();
    }
}