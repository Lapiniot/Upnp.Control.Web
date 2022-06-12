using Upnp.Control.Infrastructure.AspNetCore.Middleware;

namespace Upnp.Control.Infrastructure.AspNetCore.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddBase64Encoders(this IServiceCollection services) =>
        services
            .AddTransient<IBase64UrlEncoder, Base64Encoders>()
            .AddTransient<IBase64UrlDecoder, Base64Encoders>();

    public static IServiceCollection AddServerAddressesProvider(this IServiceCollection services) =>
        services.AddTransient<IServerAddressesProvider, ServerAddressesProvider>();

    public static IServiceCollection AddImageLoaderProxyMiddleware(this IServiceCollection services)
    {
        services.AddHttpClient<ImageLoaderProxyClient>(c => c.DefaultRequestHeaders.ConnectionClose = false)
            .SetHandlerLifetime(TimeSpan.FromMinutes(10))
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
            {
                AutomaticDecompression = System.Net.DecompressionMethods.None,
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

    public static IEndpointConventionBuilder MapCertificateDownload(this IEndpointRouteBuilder routeBuilder, string pattern) =>
        routeBuilder.MapGet(pattern, CertificateDownloadServices.GetCertificatesArchive);

    public static RouteHandlerBuilder MapAppInfo(this IEndpointRouteBuilder routeBuilder, string pattern) =>
        routeBuilder.MapGet(pattern, ApplicationInfoServices.GetApplicationInfoAsync)
            .Produces<ApplicationInfo>(StatusCodes.Status200OK, "application/json")
            .WithTags(new[] { "Application Info" })
            .WithName("GetAppInfo");
}