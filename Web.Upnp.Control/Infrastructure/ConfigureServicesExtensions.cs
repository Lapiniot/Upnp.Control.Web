using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Infrastructure.HttpClients;
using Web.Upnp.Control.Infrastructure.Middleware;
using Web.Upnp.Control.Services.Abstractions;
using static System.Net.DecompressionMethods;
using WebPushClient = Web.Upnp.Control.Infrastructure.HttpClients.WebPushClient;

namespace Web.Upnp.Control.Infrastructure
{
    public static class ConfigureServicesExtensions
    {
        public static IServiceCollection AddSoapHttpClient(this IServiceCollection services)
        {
            services.AddHttpClient<HttpSoapClient>()
                .SetHandlerLifetime(TimeSpan.FromMinutes(5))
                .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
                {
                    AutomaticDecompression = All,
                    UseProxy = false,
                    Proxy = null,
                    UseCookies = false,
                    CookieContainer = null!,
                    AllowAutoRedirect = false
                });

            return services;
        }

        public static IServiceCollection AddEventSubscribeClient(this IServiceCollection services)
        {
            services.AddTransient<IEventSubscribeClient>(sp => sp.GetRequiredService<EventSubscribeClient>())
                .AddHttpClient<EventSubscribeClient>()
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

        public static IServiceCollection AddWebPushClient(this IServiceCollection services)
        {
            services.AddHttpClient<IWebPushClient, WebPushClient>();
            services.AddOptions<VAPIDSecretOptions>().BindConfiguration("VAPID");
            services.AddOptions<WebPushOptions>().BindConfiguration("WebPush");
            return services;
        }

        public static IServiceCollection AddImageLoaderProxyMiddleware(this IServiceCollection services)
        {
            services.AddHttpClient<ImageLoaderProxyClient>(c => c.DefaultRequestHeaders.ConnectionClose = false)
                .SetHandlerLifetime(TimeSpan.FromMinutes(10))
                .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
                {
                    AutomaticDecompression = None,
                    MaxConnectionsPerServer = 1,
                    UseProxy = false,
                    UseCookies = false
                });
            services.AddOptions<ImageProxyOptions>().BindConfiguration("ImageProxy");
            return services.AddTransient<ImageLoaderProxyMiddleware>();
        }

        public static IServiceCollection AddContentProxyMiddleware(this IServiceCollection services)
        {
            services.AddOptions<ContentProxyOptions>().BindConfiguration("ContentProxy");
            return services.AddTransient<ContentProxyMiddleware>();
        }

        public static IServiceCollection AddCertificateDownloadMiddleware(this IServiceCollection services)
        {
            return services.AddTransient<CertificateDownloadMiddleware>();
        }

        public static IEndpointConventionBuilder MapImageLoaderProxy(this IEndpointRouteBuilder routeBuilder, string route)
        {
            ArgumentNullException.ThrowIfNull(routeBuilder);

            return routeBuilder.Map(route, routeBuilder
                    .CreateApplicationBuilder()
                    .UseMiddleware<ImageLoaderProxyMiddleware>()
                    .Build())
                .WithDisplayName("Image Loader Proxy Middleware");
        }

        public static IEndpointConventionBuilder MapContentProxy(this IEndpointRouteBuilder routeBuilder, string route)
        {
            ArgumentNullException.ThrowIfNull(routeBuilder);

            return routeBuilder.Map(route, routeBuilder
                    .CreateApplicationBuilder()
                    .UseMiddleware<ContentProxyMiddleware>()
                    .Build())
                .WithDisplayName("Content Proxy Middleware");
        }

        public static IEndpointConventionBuilder MapCertificateDownloadMiddleware(this IEndpointRouteBuilder routeBuilder, string pattern)
        {
            ArgumentNullException.ThrowIfNull(routeBuilder);

            return routeBuilder.Map(pattern, routeBuilder
                    .CreateApplicationBuilder()
                    .UseMiddleware<CertificateDownloadMiddleware>()
                    .Build())
                .WithDisplayName("Certificate Download Middleware");
        }
    }
}