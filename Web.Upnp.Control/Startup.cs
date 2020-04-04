﻿using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Formatters;
using Web.Upnp.Control.Hubs;
using Web.Upnp.Control.Services;
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
            services
                .AddDbContext<UpnpDbContext>(p => p.UseInMemoryDatabase("UpnpDB"))
                .AddHostedService<UpnpDiscoveryService>()
                .AddScoped<IUpnpServiceFactory, UpnpServiceFactory>()
                .AddImageProxyHttpClient()
                .AddSoapHttpClient()
                .AddEventSubscribeClient();

            services
                .AddControllers(c => c.OutputFormatters.Insert(c.OutputFormatters.Count - 1, new HttpResponseMessageFormatter()))
                .AddJsonOptions(o => o.JsonSerializerOptions.IgnoreNullValues = true);

            services.AddResponseCaching();
            services.AddSpaStaticFiles(config => { config.RootPath = "ClientApp/build"; });
            services.AddSignalR();
            services.AddOptions<JsonHubProtocolOptions>().Configure(c => c.PayloadSerializerOptions.IgnoreNullValues = true);
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