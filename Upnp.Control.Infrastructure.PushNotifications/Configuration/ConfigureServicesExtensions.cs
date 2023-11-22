using System.Net.Http.Jwt;
using Upnp.Control.Abstractions;
using Upnp.Control.Extensions.DependencyInjection;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddWebPushSender(this IServiceCollection services)
    {
        return services
            .AddHostedService(sp => sp.GetRequiredService<WebPushSenderService>())
            .AddServiceInitializer<VAPIDKeyConfigInitializer>()
            .AddSingleton<WebPushSenderService>()
            .AddSingleton<IObserver<UpnpDiscoveryEvent>>(sp => sp.GetRequiredService<WebPushSenderService>())
            .AddSingleton<IObserver<AVTPropChangedEvent>>(sp => sp.GetRequiredService<WebPushSenderService>())
            .AddTransient<IAsyncQueryHandler<PSGetServerKeyQuery, byte[]>, PSGetServerKeyQueryHandler>()
            .AddWebPushClient();
    }

    public static IServiceCollection ConfigureWebPushJsonOptions(this IServiceCollection services, Action<JsonOptions> configureOptions) =>
        services.Configure(configureOptions);

    [DynamicDependency(PublicConstructors, typeof(VAPIDSecretOptions))]
    [DynamicDependency(PublicConstructors, typeof(WebPushOptions))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "<Pending>")]

    public static IServiceCollection AddWebPushClient(this IServiceCollection services)
    {
        services.AddOptions<VAPIDSecretOptions>();
        services.AddOptions<WebPushOptions>().BindConfiguration("WebPush");
        services.AddTransient<IJwtTokenHandler>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<VAPIDSecretOptions>>().Value;
            return new JwtTokenHandlerES256Alg(options.PublicKey, options.PrivateKey);
        });
        services.AddHttpClient<IWebPushClient, WebPushClient>();
        return services.AddTransient<IConfigureOptions<VAPIDSecretOptions>, ConfigureVAPIDSecretOptions>();
    }
}