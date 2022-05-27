using IoT.Protocol.Soap;
using Upnp.Control.Abstractions;

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
                UseCookies = false
            });

        return services.AddScoped<IUpnpServiceFactory, UpnpServiceFactory>();
    }
}