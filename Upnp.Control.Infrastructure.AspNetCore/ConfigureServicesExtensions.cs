using System.Net;
using System.Net.Mime;
using Upnp.Control.Infrastructure.AspNetCore.Middleware;

namespace Upnp.Control.Infrastructure.AspNetCore;

public static class ConfigureServicesExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddBase64Encoders() =>
        services
            .AddTransient<IBase64UrlEncoder, Base64UrlConvert>()
            .AddTransient<IBase64UrlDecoder, Base64UrlConvert>();

        public IServiceCollection AddServerAddressesProvider() =>
            services.AddTransient<IServerAddressesProvider, ServerAddressesProvider>();

        [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(ImageProxyOptions))]
        [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
        public IServiceCollection AddImageLoaderProxyMiddleware()
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
            services.AddOptionsWithValidateOnStart<ImageProxyOptions, ImageProxyOptionsValidator>()
                .BindConfiguration("ImageProxy");
            return services.AddTransient<ImageLoaderProxyMiddleware>();
        }

        [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(ContentProxyOptions))]
        [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
        public IServiceCollection AddContentProxyMiddleware()
        {
            services.AddOptionsWithValidateOnStart<ContentProxyOptions, ContentProxyOptionsValidator>()
                .BindConfiguration("ContentProxy");
            return services.AddTransient<ContentProxyMiddleware>();
        }
    }

    extension(IEndpointRouteBuilder routeBuilder)
    {
        public IEndpointConventionBuilder MapImageLoaderProxy(string route)
        {
            ArgumentNullException.ThrowIfNull(routeBuilder);

            return routeBuilder.Map(route, routeBuilder
                    .CreateApplicationBuilder()
                    .UseMiddleware<ImageLoaderProxyMiddleware>()
                    .Build())

                .WithDisplayName("Image Loader Proxy Middleware");
        }

        public IEndpointConventionBuilder MapContentProxy(string route)
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
        public IEndpointConventionBuilder MapCertificateDownload(string pattern) =>
            routeBuilder.MapGet(pattern, CertificateDownloadServices.GetCertificatesArchive)
                .Produces(StatusCodes.Status200OK, contentType: MediaTypeNames.Application.Zip)
                .WithTags("SSL Certificate Download")
                .WithDisplayName("SSLCertificateDownload")
                .WithDescription("SSL Certificate Download");

        [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(ApplicationInfoServices))]
        [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(ApplicationInfo))]
        [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
        public RouteHandlerBuilder MapAppInfo(string pattern) =>
            routeBuilder.MapGet(pattern, ApplicationInfoServices.GetApplicationInfoAsync)
                .Produces<ApplicationInfo>(StatusCodes.Status200OK)
                .WithTags("Application Information")
                .WithDisplayName("GetAppInfo")
                .WithDescription("Application Information");
    }
}