﻿using System;
using System.Net.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Web.Upnp.Control.Services.Abstractions;
using Web.Upnp.Control.Services.HttpClients;
using Web.Upnp.Control.Services.Middleware;
using static System.Net.DecompressionMethods;

namespace Web.Upnp.Control.Services
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
            return services.AddTransient<ImageLoaderProxyMiddleware>();
        }

        public static IServiceCollection AddContentProxyMiddleware(this IServiceCollection services)
        {
            return services.AddTransient<ContentProxyMiddleware>();
        }

        public static IEndpointConventionBuilder MapImageLoaderProxy(this IEndpointRouteBuilder routeBuilder, string route)
        {
            return routeBuilder.Map(route, routeBuilder
                    .CreateApplicationBuilder()
                    .UseMiddleware<ImageLoaderProxyMiddleware>()
                    .Build())
                .WithDisplayName("Image Loader Proxy Middleware");
        }

        public static IEndpointConventionBuilder MapContentProxy(this IEndpointRouteBuilder routeBuilder, string route)
        {
            return routeBuilder.Map(route, routeBuilder
                    .CreateApplicationBuilder()
                    .UseMiddleware<ContentProxyMiddleware>()
                    .Build())
                .WithDisplayName("Content Proxy Middleware");
        }
    }
}