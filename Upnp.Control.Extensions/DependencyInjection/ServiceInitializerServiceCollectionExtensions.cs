namespace Upnp.Control.Extensions.DependencyInjection;

public static class ServiceInitializerServiceCollectionExtensions
{
    public static IServiceCollection AddServiceInitializer<[DynamicallyAccessedMembers(PublicConstructors)] T>
        (this IServiceCollection services, ServiceLifetime lifetime = ServiceLifetime.Transient)
        where T : IServiceInitializer
    {
        ArgumentNullException.ThrowIfNull(services);

        services.Add(new ServiceDescriptor(typeof(IServiceInitializer), typeof(T), lifetime));
        return services;
    }
}