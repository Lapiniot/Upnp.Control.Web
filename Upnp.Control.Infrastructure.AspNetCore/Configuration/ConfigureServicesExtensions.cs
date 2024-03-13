using OOs.Extensions.Hosting;
using System.Net;
using System.Net.Mime;
using Upnp.Control.Infrastructure.AspNetCore.Middleware;

namespace Upnp.Control.Infrastructure.AspNetCore.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddBase64Encoders(this IServiceCollection services) =>
        services
            .AddTransient<IBase64UrlEncoder, Base64UrlConvert>()
            .AddTransient<IBase64UrlDecoder, Base64UrlConvert>();

    public static IServiceCollection AddServerAddressesProvider(this IServiceCollection services) =>
        services.AddTransient<IServerAddressesProvider, ServerAddressesProvider>();

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(ImageProxyOptions))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static IServiceCollection AddImageLoaderProxyMiddleware(this IServiceCollection services)
    {
        services.AddHttpClient<ImageLoaderProxyClient>()
            .SetHandlerLifetime(TimeSpan.FromMinutes(10))
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
            {
                AutomaticDecompression = DecompressionMethods.None,
                MaxConnectionsPerServer = 1,
                UseProxy = false,
                UseCookies = false
            });
        services.AddTransient<IValidateOptions<ImageProxyOptions>, ImageProxyOptionsValidator>();
        services.AddOptions<ImageProxyOptions>().BindConfiguration("ImageProxy");
        return services.AddTransient<ImageLoaderProxyMiddleware>();
    }

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(ContentProxyOptions))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static IServiceCollection AddContentProxyMiddleware(this IServiceCollection services)
    {
        services.AddTransient<IValidateOptions<ContentProxyOptions>, ContentProxyOptionsValidator>();
        services.AddOptions<ContentProxyOptions>().BindConfiguration("ContentProxy");
        return services.AddTransient<ContentProxyMiddleware>();
    }

    public static IServiceCollection AddCertificateGenInitializer(this IServiceCollection services) =>
        services.AddTransient<IServiceInitializer, CertificateGenerateInitializer>();

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

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(CertificateDownloadServices))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static IEndpointConventionBuilder MapCertificateDownload(this IEndpointRouteBuilder routeBuilder, string pattern) =>
        routeBuilder.MapGet(pattern, CertificateDownloadServices.GetCertificatesArchive)
            .Produces(StatusCodes.Status200OK, contentType: MediaTypeNames.Application.Zip)
            .WithTags("SSL Certificate Download")
            .WithDisplayName("SSLCertificateDownload")
            .WithDescription("SSL Certificate Download")
            .WithOpenApi();

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(ApplicationInfoServices))]
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(ApplicationInfo))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static RouteHandlerBuilder MapAppInfo(this IEndpointRouteBuilder routeBuilder, string pattern) =>
        routeBuilder.MapGet(pattern, ApplicationInfoServices.GetApplicationInfoAsync)
            .Produces<ApplicationInfo>(StatusCodes.Status200OK)
            .WithTags("Application Information")
            .WithDisplayName("GetAppInfo")
            .WithDescription("Application Information");
}