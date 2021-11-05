using Web.Upnp.Control.Infrastructure.HttpClients;
using Web.Upnp.Control.Services.Abstractions;

using static System.Net.DecompressionMethods;

namespace Web.Upnp.Control.Infrastructure;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddSoapHttpClient(this IServiceCollection services)
    {
        services.AddHttpClient<HttpSoapClient>()
            .SetHandlerLifetime(TimeSpan.FromMinutes(5))
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
            {
                AutomaticDecompression = All,
                UseProxy = false,
                Proxy = null,
                UseCookies = false,
                CookieContainer = null!,
                AllowAutoRedirect = false
            });

        return services;
    }

    public static IServiceCollection AddEventSubscribeClient(this IServiceCollection services)
    {
        services.AddTransient<IEventSubscribeClient>(sp => sp.GetRequiredService<EventSubscribeClient>())
            .AddHttpClient<EventSubscribeClient>()
            .SetHandlerLifetime(TimeSpan.FromMinutes(5))
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
            {
                Proxy = null,
                CookieContainer = null!,
                UseProxy = false,
                UseCookies = false,
                AllowAutoRedirect = false
            });

        return services;
    }
}