using Upnp.Control.Infrastructure.UpnpEvents.Configuration;
using Upnp.Control.Models.Events;

namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

public static class ConfigureServicesExtensions
{
    private static readonly UpnpEventsOptionsBinder binder = new();

    public static IServiceCollection AddUpnpEventsSubscription(this IServiceCollection services,
        Action<OptionsBuilder<UpnpEventsOptions>> configure = null)
    {
        var builder = services.AddOptions<UpnpEventsOptions>();

        if(configure is not null)
        {
            configure(builder);
        }

        builder.Configure(binder, "UpnpEventSubscriptions");

        return services.AddSingleton<IObserver<UpnpDiscoveryEvent>, UpnpEventSubscriptionService>()
            .AddTransient<IUpnpEventSubscriptionRepository, InMemorySubscriptionsRepository>()
            .AddTransient<IUpnpEventSubscriptionFactory, UpnpEventSubscriptionFactory>()
            .AddEventSubscribeClient();
    }

    public static IServiceCollection AddUpnpEventsSubscription(this IServiceCollection services,
        Action<UpnpEventsOptions> configureOptions)
    {
        ArgumentNullException.ThrowIfNull(configureOptions);
        return services.AddUpnpEventsSubscription(builder => builder.Configure(configureOptions));
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