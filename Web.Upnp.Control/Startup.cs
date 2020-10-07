using System;
using System.Collections.Generic;
using System.Text.Json;
using IoT.Protocol.Upnp;
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
using Web.Upnp.Control.Routing;
using Web.Upnp.Control.Services;
using Web.Upnp.Control.Services.Abstractions;
using Web.Upnp.Control.Services.HttpClients;

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
            services.AddDbContext<UpnpDbContext>(p => p.UseInMemoryDatabase("UpnpDB"))
                .AddHostedService<UpnpDiscoveryService>()
                .AddScoped<IUpnpServiceFactory, UpnpServiceFactory>()
                .AddTransient<IUpnpEventSubscriptionFactory, UpnpEventSubscriptionFactory>()
                .AddTransient<IUpnpSubscriptionsRepository, InMemorySubscriptionsRepository>()
                .AddTransient<IObserver<UpnpDiscoveryEvent>, UpnpDiscoverySignalRNotifyObserver>()
                .AddTransient<IObserver<UpnpDiscoveryEvent>, UpnpEventSubscribeObserver>()
                .AddTransient<IUpnpServiceMetadataProvider, UpnpServiceMetadataProvider>()
                .AddTransient<IAsyncEnumerable<SsdpReply>>(sp => new SsdpEventEnumerator(TimeSpan.FromSeconds(120), UpnpServices.RootDevice))
                .AddSoapHttpClient()
                .AddEventSubscribeClient();

            services
                .Configure<RouteOptions>(options => options.ConstraintMap.Add("timespan", typeof(TimeSpanRouteConstraint)))
                .AddControllers(options => options.Filters.Add<RequestCancelledExceptionFilter>())
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.IgnoreNullValues = true;
                    options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
                    options.JsonSerializerOptions.Converters.Add(new IconJsonConverter());
                    options.JsonSerializerOptions.Converters.Add(new ServiceJsonConverter());
                    options.JsonSerializerOptions.Converters.Add(new DeviceJsonConverter());
                });

            services.AddResponseCaching();
            services.AddSpaStaticFiles(config => { config.RootPath = "ClientApp/build"; });
            services.AddImageLoaderProxyMiddleware();
            services.AddSignalR().AddJsonProtocol(c =>
            {
                c.PayloadSerializerOptions.IgnoreNullValues = true;
                c.PayloadSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
            });
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