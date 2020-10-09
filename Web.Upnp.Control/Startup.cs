using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp;
using IoT.Protocol.Upnp.DIDL;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Hubs;
using Web.Upnp.Control.Models.Converters;
using Web.Upnp.Control.Models.Events;
using Web.Upnp.Control.Routing;
using Web.Upnp.Control.Services;
using Web.Upnp.Control.Services.Abstractions;

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
                .AddDbContext<UpnpDbContext>(p => p.UseInMemoryDatabase("UpnpDB"))
                //.AddDbContext<UpnpDbContext>(p => p.UseSqlite("Data Source=upnp.db3;"))
                .AddHostedService<UpnpDiscoveryService>()
                .AddScoped<IUpnpServiceFactory, UpnpServiceFactory>()
                .AddTransient<IUpnpEventSubscriptionFactory, UpnpEventSubscriptionFactory>()
                .AddTransient<IUpnpSubscriptionsRepository, InMemorySubscriptionsRepository>()
                .AddTransient<IObserver<UpnpDiscoveryEvent>, UpnpDiscoverySignalRNotifyObserver>()
                .AddTransient<IObserver<UpnpDiscoveryEvent>, UpnpEventSubscribeObserver>()
                .AddTransient<IObserver<UpnpEvent>, UpnpEventSignalRNotifyObserver>()
                .AddTransient<IUpnpServiceMetadataProvider, UpnpServiceMetadataProvider>()
                .AddTransient<IAsyncEnumerable<SsdpReply>>(sp => new SsdpEventEnumerator(TimeSpan.FromSeconds(120), UpnpServices.RootDevice))
                .AddSoapHttpClient()
                .AddEventSubscribeClient();

            var customConverters = new JsonConverter[]
            {
                new IconJsonConverter(),
                new ServiceJsonConverter(),
                new DeviceJsonConverter(),
                new DIDLItemJsonConverter()
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

            app.UseRouting()
                .UseEndpoints(endpoints =>
                {
                    endpoints.MapDefaultControllerRoute();
                    endpoints.MapHub<UpnpEventsHub>("/upnpevents", o => o.Transports = HttpTransportType.WebSockets);
                    endpoints.MapImageLoaderProxy("/proxy/{*url}");
                })
                .UseHttpsRedirection()
                .UseStaticFiles()
                .UseResponseCaching();

            app.UseSpaStaticFiles();
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