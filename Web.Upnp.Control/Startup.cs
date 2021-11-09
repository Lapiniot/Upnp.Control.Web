﻿using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using Upnp.Control.DataAccess.Configurations;
using Upnp.Control.Infrastructure.AspNetCore.Configuration;
using Upnp.Control.Infrastructure.Configuration;
using Upnp.Control.Infrastructure.Middleware.Configuration;
using Upnp.Control.Infrastructure.PushNotifications.Configuration;
using Upnp.Control.Infrastructure.SignalR.Configuration;
using Upnp.Control.Infrastructure.Upnp.Configuration;
using Upnp.Control.Infrastructure.UpnpEvents.Configuration;
using Upnp.Control.Services.Commands.Configuration;
using Upnp.Control.Services.Queries.Configuration;
using Web.Upnp.Control.Models.Converters;
using PushConfiguration = Upnp.Control.Infrastructure.PushNotifications.Configuration;

namespace Web.Upnp.Control;

public class Startup
{
    public Startup(IConfiguration configuration, IWebHostEnvironment environment)
    {
        Configuration = configuration;
        Environment = environment;
    }

    public IConfiguration Configuration { get; }
    public IWebHostEnvironment Environment { get; }

    // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
    public void ConfigureServices(IServiceCollection services)
    {
        services
            .AddServicesInit()
            .AddWebPushSender()
            .AddUpnpEventsSubscription(o => o.MapRenderingControl("api/events/{0}/notify/rc").MapAVTransport("api/events/{0}/notify/avt"))
            .AddUpnpDeviceSqliteDatabase(Path.Combine(Environment.ContentRootPath, "data/upnp.db3"))
            .AddPushSubscriptionSqliteDatabase(Path.Combine(Environment.ContentRootPath, "data/subscriptions.db3"))
            .AddSignalRUpnpDiscoveryNotifications()
            .AddSignalRUpnpEventNotifications()
            .AddBase64Encoders()
            .AddServerAddressesProvider()
            .AddUpnpServiceFactory()
            .AddQueries()
            .AddCommands();

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

        services.Configure<PushConfiguration.JsonOptions>(options => ConfigureJsonSerializer(options.SerializerOptions, customConverters));

        services.AddControllers(options => options
                .AddBinaryContentFormatter()
                .AddRequestCancelledExceptionFilter())
            .AddJsonOptions(options => ConfigureJsonSerializer(options.JsonSerializerOptions, customConverters));

        services.AddSignalR()
            .AddJsonProtocol(options => ConfigureJsonSerializer(options.PayloadSerializerOptions, customConverters));

        services.AddResponseCaching();
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
        options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;

        foreach(var converter in converters)
        {
            options.Converters.Add(converter);
        }

        //options.AddContext<JsonContext>();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if(env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseStaticFiles();

        app.UseRouting();

        app.UseResponseCaching();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapDefaultControllerRoute();
            endpoints.MapUpnpEventsHub("upnpevents");
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
    }
}