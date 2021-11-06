using IoT.Protocol.Soap;
using Upnp.Control.Services;

namespace Upnp.Control.Infrastructure.Upnp.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddUpnpServiceFactory(this IServiceCollection services)
    {
        services
            .AddHttpClient<SoapHttpClient>()
            .SetHandlerLifetime(TimeSpan.FromMinutes(5))
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
            {
                AutomaticDecompression = System.Net.DecompressionMethods.All,
                AllowAutoRedirect = false,
                UseProxy = false,
                Proxy = null,
                UseCookies = false,
                CookieContainer = null
            });

        return services.AddScoped<IUpnpServiceFactory, UpnpServiceFactory>();
    }
}