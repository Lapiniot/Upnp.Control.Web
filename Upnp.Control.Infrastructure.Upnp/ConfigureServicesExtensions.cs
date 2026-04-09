namespace Upnp.Control.Infrastructure.Upnp;

public static class ConfigureServicesExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddUpnpServiceFactory()
        {
            services.AddHttpClient<SoapHttpClient>()
                .SetHandlerLifetime(TimeSpan.FromMinutes(5))
                .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
                {
                    AutomaticDecompression = System.Net.DecompressionMethods.All,
                    AllowAutoRedirect = false,
                    UseProxy = false,
                    Proxy = null,
                    UseCookies = false
                });

            return services.AddScoped<IUpnpServiceFactory, UpnpServiceFactory>();
        }
    }
}