using System.Net.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Services;
using static System.Net.DecompressionMethods;

namespace Web.Upnp.Control
{
    public class Startup
    {
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<UpnpDbContext>(p => p.UseInMemoryDatabase("UpnpDB"));

            services.AddHostedService<UpnpDiscoveryService>();

            services.AddSpaStaticFiles(config => { config.RootPath = "ClientApp/build"; });

            services.AddResponseCaching();

            services.AddResponseCompression(o => { });

            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Latest)
                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
                    options.SerializerSettings.Formatting = Formatting.None;
                })
                .AddMvcOptions(options => { options.OutputFormatters.Insert(options.OutputFormatters.Count - 1, new HttpResponseMessageFormatter()); });

            services.AddHttpClient<HttpClient>("ImageLoader", c =>
                {
                    c.DefaultRequestHeaders.ConnectionClose = false;
                    c.DefaultRequestHeaders.Add("Accept-Encoding", new[] {"gzip", "deflate"});
                })
                .ConfigurePrimaryHttpMessageHandler(() =>
                    new SocketsHttpHandler
                    {
                        AutomaticDecompression = None,
                        MaxConnectionsPerServer = 1
                    });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if(env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            //app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseMvcWithDefaultRoute();

            app.UseResponseCaching();

            app.UseResponseCompression();

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