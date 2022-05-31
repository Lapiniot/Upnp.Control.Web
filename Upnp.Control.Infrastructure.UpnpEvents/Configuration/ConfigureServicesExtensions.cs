using Upnp.Control.Infrastructure.Configuration;

namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

public static class ConfigureServicesExtensions
{
    private static readonly UpnpEventsOptionsBinder Binder = new();

    public static IServiceCollection AddUpnpEventsSubscription(this IServiceCollection services,
        Action<OptionsBuilder<UpnpEventsOptions>> configure = null) =>
        services
            .ConfigureUpnpEventsOptions(configure)
            .AddSingleton<IObserver<UpnpDiscoveryEvent>, UpnpEventSubscriptionService>()
            .AddTransient<IUpnpEventSubscriptionRepository, InMemorySubscriptionsRepository>()
            .AddTransient<IUpnpEventSubscriptionFactory, UpnpEventSubscriptionFactory>()
            .AddTransient<IAsyncCommandHandler<AVTPropChangedCommand>, AVTPropChangedEventCommandHandler>()
            .AddTransient<IAsyncCommandHandler<RCPropChangedCommand>, RCPropChangedEventCommandHandler>()
            .AddEventSubscribeClient();

    public static IServiceCollection AddUpnpEventsSubscription(this IServiceCollection services, Action<UpnpEventsOptions> configureOptions)
    {
        ArgumentNullException.ThrowIfNull(configureOptions);

        return services.AddUpnpEventsSubscription(builder => builder.Configure(configureOptions));
    }

    public static IServiceCollection ConfigureUpnpEventsOptions(this IServiceCollection services, Action<OptionsBuilder<UpnpEventsOptions>> configure)
    {
        var builder = services.AddOptions<UpnpEventsOptions>().Configure(Binder, "UpnpEventSubscriptions");
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