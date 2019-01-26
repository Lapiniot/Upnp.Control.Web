using System;
using System.Net.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Services;
using Web.Upnp.Control.Services.HttpClients;
using static System.Net.DecompressionMethods;
using static Newtonsoft.Json.NullValueHandling;

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
            services.AddDbContext<UpnpDbContext>(p => p.UseInMemoryDatabase("UpnpDB"));

            services.AddHostedService<UpnpDiscoveryService>();

            services.AddScoped<IUpnpServiceFactory, UpnpServiceFactory>();

            services.AddSpaStaticFiles(config => { config.RootPath = "ClientApp/build"; });

            services.AddResponseCaching();

            services.AddMvcCore()
                .AddNewtonsoftJson(o => { o.SerializerSettings.NullValueHandling = Ignore; })
                .AddMvcOptions(o => { o.OutputFormatters.Insert(o.OutputFormatters.Count - 1, new HttpResponseMessageFormatter()); });

            ConfigureHttpClients(services);
        }

        private static void ConfigureHttpClients(IServiceCollection services)
        {
            services.AddHttpClient<HttpClient>(nameof(ImageLoaderProxyClient),
                    c => c.DefaultRequestHeaders.ConnectionClose = false)
                .SetHandlerLifetime(TimeSpan.FromMinutes(10))
                .AddTypedClient<ImageLoaderProxyClient>()
                .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
                {
                    AutomaticDecompression = None,
                    MaxConnectionsPerServer = 1
                });

            services.AddHttpClient<HttpClient>(nameof(HttpSoapClient),
                    c => c.DefaultRequestHeaders.Add("Accept-Encoding", "gzip,deflate"))
                .SetHandlerLifetime(TimeSpan.FromMinutes(5))
                .AddTypedClient<HttpSoapClient>()
                .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
                {
                    AutomaticDecompression = GZip | Deflate,
                    UseProxy = false,
                    Proxy = null,
                    UseCookies = false,
                    CookieContainer = null,
                    AllowAutoRedirect = false
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if(env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseMvcWithDefaultRoute();
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseResponseCaching();

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