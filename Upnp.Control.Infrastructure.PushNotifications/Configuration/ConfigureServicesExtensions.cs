using System.Text.Json;
using Upnp.Control.Abstractions;
using Upnp.Control.Extensions.DependencyInjection;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddWebPushSender(this IServiceCollection services, Action<JsonSerializerOptions> configureJsonOptions = null)
    {
        var builder = services.AddOptions<JsonOptions>();

        if (configureJsonOptions is not null)
        {
            builder.Configure(o => configureJsonOptions(o.SerializerOptions));
        }

        return services
            .AddHostedService(sp => sp.GetRequiredService<WebPushSenderService>())
            .AddServiceInitializer<VAPIDKeyConfigInitializer>()
            .AddSingleton<WebPushSenderService>()
            .AddSingleton<IObserver<UpnpDiscoveryEvent>>(sp => sp.GetRequiredService<WebPushSenderService>())
            .AddSingleton<IObserver<AVTPropChangedEvent>>(sp => sp.GetRequiredService<WebPushSenderService>())
            .AddTransient<IAsyncQueryHandler<PSGetServerKeyQuery, byte[]>, PSGetServerKeyQueryHandler>()
            .AddWebPushClient();
    }

    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode")]
    [DynamicDependency(PublicConstructors, typeof(VAPIDSecretOptions))]
    [DynamicDependency(PublicConstructors, typeof(WebPushOptions))]
    public static IServiceCollection AddWebPushClient(this IServiceCollection services)
    {
        services.AddOptions<VAPIDSecretOptions>();
        services.AddOptions<WebPushOptions>().BindConfiguration("WebPush");
        services.AddHttpClient<IWebPushClient, WebPushClient>();
        return services.AddTransient<IConfigureOptions<VAPIDSecretOptions>, ConfigureVAPIDSecretOptions>();
    }
}