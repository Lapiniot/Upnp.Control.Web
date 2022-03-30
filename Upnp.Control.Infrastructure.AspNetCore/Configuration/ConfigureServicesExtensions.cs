using Upnp.Control.Infrastructure.AspNetCore.Middleware;

namespace Upnp.Control.Infrastructure.AspNetCore.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddBase64Encoders(this IServiceCollection services)
    {
        return services
            .AddTransient<IBase64UrlEncoder, Base64Encoders>()
            .AddTransient<IBase64UrlDecoder, Base64Encoders>();
    }

    public static IServiceCollection AddServerAddressesProvider(this IServiceCollection services) =>
        services.AddTransient<IServerAddressesProvider, ServerAddressesProvider>();

    public static MvcOptions AddBinaryContentFormatter(this MvcOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        if (!options.OutputFormatters.Any(formatter => formatter is BinaryContentOutputFormatter))
        {
            options.OutputFormatters.Add(new BinaryContentOutputFormatter());
        }

        return options;
    }

    public static MvcOptions AddRequestCancelledExceptionFilter(this MvcOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        if (!options.Filters.Any(filter => filter is RequestCancelledExceptionFilterAttribute))
        {
            options.Filters.Add<RequestCancelledExceptionFilterAttribute>();
        }

        return options;
    }

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

    public static IServiceCollection AddCertificateDownloadMiddleware(this IServiceCollection services) =>
        services.AddTransient<CertificateDownloadMiddleware>();

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