﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Policies;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Hubs;
using Web.Upnp.Control.Infrastructure;
using Web.Upnp.Control.Infrastructure.Routing;
using Web.Upnp.Control.Models.Converters;
using Web.Upnp.Control.Models.Events;
using Web.Upnp.Control.Services;
using Web.Upnp.Control.Services.Abstractions;
using Web.Upnp.Control.Services.Commands;
using Web.Upnp.Control.Services.Queries;

namespace Web.Upnp.Control
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services
                //.AddDbContext<UpnpDbContext>(p => p.UseInMemoryDatabase("UpnpDB"))
                .AddDbContext<UpnpDbContext>(builder => builder
                    .UseSqlite("Data Source=upnp.db3;", o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))
                    .ConfigureWarnings(w => w.Ignore(CoreEventId.RowLimitingOperationWithoutOrderByWarning)))
                .AddDbContext<PushSubscriptionDbContext>(builder => builder
                    .UseSqlite("Data Source=subscriptions.db3;", o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))
                    .ConfigureWarnings(w => w.Ignore(CoreEventId.RowLimitingOperationWithoutOrderByWarning)))
                .AddScoped<IUpnpServiceFactory, UpnpServiceFactory>()
                .AddTransient<IUpnpEventSubscriptionFactory, UpnpEventSubscriptionFactory>()
                .AddTransient<IUpnpSubscriptionsRepository, InMemorySubscriptionsRepository>()
                .AddScoped<IObserver<UpnpDiscoveryEvent>, UpnpDiscoverySignalRNotifyObserver>()
                .AddScoped<IObserver<UpnpDiscoveryEvent>, UpnpDiscoveryPushNotificationObserver>()
                .AddScoped<IObserver<UpnpDiscoveryEvent>, UpnpEventSubscribeObserver>()
                .AddScoped<IObserver<UpnpEvent>, UpnpEventSignalRNotifyObserver>()
                .AddTransient<IUpnpServiceMetadataProvider, UpnpServiceMetadataProvider>()
                .AddTransient<IAsyncEnumerable<SsdpReply>>(_ => new SsdpEventEnumerator(UpnpServices.RootDevice,
                    new RepeatPolicyBuilder()
                        .WithExponentialInterval(2, 180)
                        .WithJitter(500, 1000)
                        .Build()))
                .AddSoapHttpClient()
                .AddEventSubscribeClient()
                .AddWebPushClient()
                .AddQueryServices()
                .AddCommandServices();

            services.AddOptions<UpnpEventOptions>().BindConfiguration("UpnpEventSubscriptions");
            services.AddOptions<PlaylistOptions>().BindConfiguration("Playlists");

            var customConverters = new JsonConverter[]
            {
                new IconJsonConverter(),
                new ServiceJsonConverter(),
                new DeviceJsonConverter(),
                new ItemJsonConverter(),
                new ResourceJsonConverter(),
                new ContainerJsonConverter(),
                new MediaItemJsonConverter(),
                new CDContentConverter()
            };

            services
                .Configure((Action<RouteOptions>)(options => options.ConstraintMap.Add("timespan", typeof(TimeSpanRouteConstraint))))
                .AddControllers(options => options.Filters.Add<RequestCancelledExceptionFilter>())
                .AddJsonOptions(options => ConfigureJsonSerializer(options.JsonSerializerOptions, customConverters));

            services
                .AddSignalR()
                .AddJsonProtocol(options => ConfigureJsonSerializer(options.PayloadSerializerOptions, customConverters));

            services.AddResponseCaching();
            services.AddSpaStaticFiles(config => { config.RootPath = "ClientApp/build"; });
            services.AddImageLoaderProxyMiddleware();
            services.AddContentProxyMiddleware();
            services.AddCertificateDownloadMiddleware();

            services.AddSwaggerGen(c =>
            {
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                c.IncludeXmlComments(xmlPath);
            });

            services.AddHealthChecks();
        }

        private static void ConfigureJsonSerializer(JsonSerializerOptions options, IEnumerable<JsonConverter> converters)
        {
            options.IgnoreNullValues = true;
            options.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
            foreach(var converter in converters)
            {
                options.Converters.Add(converter);
            }
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if(env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseResponseCaching();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapDefaultControllerRoute();
                endpoints.MapHub<UpnpEventsHub>("upnpevents", o => o.Transports = HttpTransportType.WebSockets);
                endpoints.MapImageLoaderProxy("proxy/{*url}");
                endpoints.MapContentProxy("dlna-proxy/{*url}");
                endpoints.MapHealthChecks("api/health");
                endpoints.MapCertificateDownloadMiddleware("api/cert");
                endpoints.MapSwagger("api/swagger/{documentName}/swagger.json");
            });

            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/api/swagger/v1/swagger.json", "UPnP Control API V1");
                c.RoutePrefix = "api/swagger";
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if(env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer("start");
                }
            });
        }
    }
}