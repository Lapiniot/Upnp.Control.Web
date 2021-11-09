using Upnp.Control.Models.Events;
using Upnp.Control.Models.PushNotifications;
using Upnp.Control.Services;

namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddWebPushSender(this IServiceCollection services)
    {
        services.AddOptions<JsonOptions>();
        return services
            .AddHostedService(sp => sp.GetRequiredService<WebPushSenderService>())
            .AddSingleton<WebPushSenderService>()
            .AddSingleton<IObserver<UpnpDiscoveryEvent>>(sp => sp.GetRequiredService<WebPushSenderService>())
            .AddSingleton<IObserver<UpnpEvent>>(sp => sp.GetRequiredService<WebPushSenderService>())
            .AddTransient<IServiceInitializer, VAPIDKeyConfigInitializer>()
            .AddTransient<IAsyncQueryHandler<PSGetServerKeyQuery, byte[]>, PSGetServerKeyQueryHandler>()
            .AddWebPushClient();
    }

    public static IServiceCollection AddWebPushClient(this IServiceCollection services)
    {
        services.AddOptions<VAPIDSecretOptions>();
        services.AddOptions<WebPushOptions>().BindConfiguration("WebPush");
        services.AddHttpClient<IWebPushClient, WebPushClient>();
        return services.AddTransient<IConfigureOptions<VAPIDSecretOptions>, ConfigureVAPIDSecretOptions>();
    }
}