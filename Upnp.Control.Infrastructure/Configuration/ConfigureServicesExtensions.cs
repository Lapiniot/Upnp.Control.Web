namespace Upnp.Control.Infrastructure.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddServicesInit(this IServiceCollection services)
    {
        return services.AddHostedService<ApplicationInitService>();
    }
}