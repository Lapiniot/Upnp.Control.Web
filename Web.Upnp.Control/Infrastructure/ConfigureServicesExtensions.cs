using IoT.Protocol.Soap;
using Web.Upnp.Control.Services;
using Web.Upnp.Control.Services.Abstractions;

using static System.Net.DecompressionMethods;

namespace Web.Upnp.Control.Infrastructure;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddUpnpServiceFactory(this IServiceCollection services)
    {
        services
            .AddHttpClient<SoapHttpClient>()
            .SetHandlerLifetime(TimeSpan.FromMinutes(5))
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
            {
                AutomaticDecompression = All,
                AllowAutoRedirect = false,
                UseProxy = false,
                Proxy = null,
                UseCookies = false,
                CookieContainer = null
            });

        return services.AddScoped<IUpnpServiceFactory, UpnpServiceFactory>();
    }
}