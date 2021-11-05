using Microsoft.AspNetCore.Builder;
using Upnp.Control.Infrastructure.Middleware.Configuration;

using static System.Net.DecompressionMethods;

namespace Upnp.Control.Infrastructure.Middleware;

public static class ConfigureServicesExtensions
{
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