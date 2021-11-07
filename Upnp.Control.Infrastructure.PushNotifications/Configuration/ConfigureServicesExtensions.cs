using Microsoft.Extensions.DependencyInjection;
using Upnp.Control.Models.Events;
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
            .AddWebPushClient();
    }

    public static IServiceCollection AddWebPushClient(this IServiceCollection services)
    {
        services.AddHttpClient<IWebPushClient, WebPushClient>();
        services.AddOptions<VAPIDSecretOptions>().BindConfiguration("VAPID");
        services.AddOptions<WebPushOptions>().BindConfiguration("WebPush");
        return services;
    }
}