using System;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;
using static System.Net.DecompressionMethods;

namespace Web.Upnp.Control.Services.HttpClients
{
    public static class TypedHttpClientsExtensions
    {
        public static IServiceCollection AddImageProxyHttpClient(this IServiceCollection services)
        {
            services.AddHttpClient<ImageLoaderProxyClient>(c => c.DefaultRequestHeaders.ConnectionClose = false)
                .SetHandlerLifetime(TimeSpan.FromMinutes(10))
                .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
                {
                    AutomaticDecompression = None,
                    MaxConnectionsPerServer = 1
                });

            return services;
        }

        public static IServiceCollection AddSoapHttpClient(this IServiceCollection services)
        {
            services.AddHttpClient<HttpSoapClient>(c => c.DefaultRequestHeaders.Add("Accept-Encoding", "gzip,deflate"))
                .SetHandlerLifetime(TimeSpan.FromMinutes(5))
                .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
                {
                    AutomaticDecompression = GZip | Deflate,
                    UseProxy = false,
                    Proxy = null,
                    UseCookies = false,
                    CookieContainer = null,
                    AllowAutoRedirect = false
                });

            return services;
        }

        public static IServiceCollection AddEventSubscribeClient(this IServiceCollection services)
        {
            services.AddHttpClient<EventSubscribeClient>()
                .SetHandlerLifetime(TimeSpan.FromMinutes(5))
                .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
                {
                    Proxy = null,
                    CookieContainer = null,
                    UseProxy = false,
                    UseCookies = false,
                    AllowAutoRedirect = false
                });

            return services;
        }
    }
}