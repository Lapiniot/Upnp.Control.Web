using Upnp.Control.Services;

namespace Upnp.Control.Infrastructure.AspNetCore.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddBase64Encoders(this IServiceCollection services)
    {
        return services
            .AddTransient<IBase64UrlEncoder, Base64Encoders>()
            .AddTransient<IBase64UrlDecoder, Base64Encoders>();
    }

    public static IServiceCollection AddServerAddressesProvider(this IServiceCollection services)
    {
        return services.AddTransient<IServerAddressesProvider, ServerAddressesProvider>();
    }
}