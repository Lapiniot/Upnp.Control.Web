using Upnp.Control.Infrastructure.Configuration;

namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

public static class ConfigureServicesExtensions
{
    private static readonly UpnpEventsOptionsBinder binder = new();

    public static IServiceCollection AddUpnpEventsSubscription(this IServiceCollection services,
        Action<OptionsBuilder<UpnpEventsOptions>> configure = null)
    {
        return services
            .ConfigureUpnpEventsOptions(configure)
            .AddSingleton<IObserver<UpnpDiscoveryEvent>, UpnpEventSubscriptionService>()
            .AddTransient<IUpnpEventSubscriptionRepository, InMemorySubscriptionsRepository>()
            .AddTransient<IUpnpEventSubscriptionFactory, UpnpEventSubscriptionFactory>()
            .AddTransient<IAsyncCommandHandler<PropChangedUpnpEventCommand<AVTPropChangedEvent>>, AVTPropChangedEventCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PropChangedUpnpEventCommand<RCPropChangedEvent>>, PropChangedUpnpEventCommandHandler<RCPropChangedEvent>>()
            .AddEventSubscribeClient();
    }

    public static IServiceCollection AddUpnpEventsSubscription(this IServiceCollection services, Action<UpnpEventsOptions> configureOptions)
    {
        ArgumentNullException.ThrowIfNull(configureOptions);

        return services.AddUpnpEventsSubscription(builder => builder.Configure(configureOptions));
    }

    public static IServiceCollection ConfigureUpnpEventsOptions(this IServiceCollection services, Action<OptionsBuilder<UpnpEventsOptions>> configure)
    {
        var builder = services.AddOptions<UpnpEventsOptions>().Configure(binder, "UpnpEventSubscriptions");
        configure?.Invoke(builder);
        return services;
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