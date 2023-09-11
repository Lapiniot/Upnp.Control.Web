using Upnp.Control.Infrastructure.Configuration;

namespace Upnp.Control.Infrastructure.UpnpEvents.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddUpnpEventsSubscription(this IServiceCollection services, Action<OptionsBuilder<UpnpEventsOptions>> configure = null) => services
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
        var builder = services.AddOptions<UpnpEventsOptions>().Configure<IConfiguration>(ConfigureUpnpEventsOptions);
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

    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    private static void ConfigureUpnpEventsOptions(UpnpEventsOptions options, IConfiguration configuration)
    {
        configuration = configuration.GetSection("UpnpEventSubscriptions");
        var timeout = configuration.GetSection(nameof(UpnpEventsOptions.SessionTimeout));
        if (timeout.Exists())
        {
            options.SessionTimeout = timeout.Get<TimeSpan>();
        }

        var mappings = configuration.GetSection(nameof(UpnpEventsOptions.CallbackMappings));
        if (!mappings.Exists()) return;
        foreach (var mapping in mappings.GetChildren())
        {
            foreach (var node in mapping.TraverseTreeDeep())
            {
                if (node.Value is null) continue;
                var start = mappings.Path.Length + 1;
                options.CallbackMappings[node.Path[start..]] = node.Value;
            }
        }
    }
}