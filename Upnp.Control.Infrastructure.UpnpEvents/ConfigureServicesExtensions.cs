using Upnp.Control.Infrastructure.UpnpEvents.Configuration;
using Upnp.Control.Models.Events;

namespace Upnp.Control.Infrastructure.UpnpEvents;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddUpnpEventsSubscription(this IServiceCollection services)
    {
        services.AddOptions<UpnpEventsOptions>().BindConfiguration("UpnpEventSubscriptions");
        return services.AddSingleton<IObserver<UpnpDiscoveryEvent>, UpnpEventSubscriptionService>()
            .AddTransient<IUpnpEventSubscriptionRepository, InMemorySubscriptionsRepository>()
            .AddTransient<IUpnpEventSubscriptionFactory, UpnpEventSubscriptionFactory>()
            .AddEventSubscribeClient();
    }

    public static IServiceCollection AddEventSubscribeClient(this IServiceCollection services)
    {
        services.AddHttpClient<IEventSubscribeClient, EventSubscribeClient>()
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