namespace Upnp.Control.Infrastructure.UpnpEvents;

public static class ConfigureServicesExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddUpnpEventsSubscription(Action<UpnpEventsOptions> configureOptions = null)
        {
            services.AddTransient<IValidateOptions<UpnpEventsOptions>, UpnpEventsOptionsValidator>();
            var builder = services.AddOptions<UpnpEventsOptions>().
                Configure<IConfiguration>(ConfigureUpnpEventsOptions);
            if (configureOptions is not null)
            {
                builder.Configure(configureOptions);
            }

            services.AddSingleton<IObserver<UpnpDiscoveryEvent>, UpnpEventSubscriptionService>();
            services.AddTransient<IEventSubscriptionStore, InMemoryEventSubscriptionStore>();
            services.AddTransient<IUpnpEventSubscriptionFactory, UpnpEventSubscriptionFactory>();
            services.AddTransient<ICommandHandler<AVTPropChangedCommand>, AVTPropChangedEventCommandHandler>();
            services.AddTransient<ICommandHandler<RCPropChangedCommand>, RCPropChangedEventCommandHandler>();
            services.AddEventSubscribeClient();
            return services;
        }

        public IServiceCollection AddEventSubscribeClient()
        {
            services.AddHttpClient<IEventSubscribeClient, EventSubscribeClient>()
                .SetHandlerLifetime(TimeSpan.FromMinutes(5))
                .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
                {
                    Proxy = null,
                    CookieContainer = null,
                    UseProxy = false,
                    UseCookies = false,
                    AllowAutoRedirect = false
                });

            return services;
        }
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