using System.Net.Sockets;
using System.Policies;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.Extensions.Options;
using Upnp.Control.DataAccess;
using Upnp.Control.Infrastructure.Middleware;
using Upnp.Control.Infrastructure.PushNotifications;
using Upnp.Control.Infrastructure.PushNotifications.Configuration;
using Upnp.Control.Infrastructure.UpnpEvents;
using Upnp.Control.Models.Events;
using Upnp.Control.Services;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Hubs;
using Web.Upnp.Control.Infrastructure;
using Web.Upnp.Control.Models.Converters;
using Web.Upnp.Control.Services;
using Web.Upnp.Control.Services.Commands;
using Web.Upnp.Control.Services.Queries;

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
            .AddHostedService<ApplicationInitService>()
            .AddWebPushSender()
            .AddUpnpEventsSubscription()
            .AddUpnpDeviceSqliteDatabase(Path.Combine(Environment.ContentRootPath, "data/upnp.db3"))
            .AddPushSubscriptionSqliteDatabase(Path.Combine(Environment.ContentRootPath, "data/subscriptions.db3"))
            .AddSingleton<IObserver<UpnpDiscoveryEvent>, UpnpDiscoverySignalRNotifyObserver>()
            .AddSingleton<IObserver<UpnpEvent>, UpnpEventSignalRNotifyObserver>()
            .AddTransient<IServerAddressesProvider, ServerAddressesProvider>()
            .AddTransient(sp => SsdpEnumeratorFactory(sp))
            .AddUpnpServiceFactory()
            .AddQueryServices()
            .AddCommandServices();

        services.AddOptions<PlaylistOptions>().BindConfiguration("Playlists");
        services.AddOptions<SsdpOptions>().BindConfiguration("SSDP");

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
            .Configure<JsonOptions>(options => ConfigureJsonSerializer(options.SerializerOptions, customConverters));

        services
            .AddControllers(options =>
            {
                options.Filters.Add<RequestCancelledExceptionFilterAttribute>();
                options.OutputFormatters.Add(new BinaryContentOutputFormatter());
            })
            .AddJsonOptions(options => ConfigureJsonSerializer(options.JsonSerializerOptions, customConverters));

        services
            .AddSignalR()
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

    private static IAsyncEnumerable<SsdpReply> SsdpEnumeratorFactory(IServiceProvider serviceProvider)
    {
        var options = serviceProvider.GetRequiredService<IOptions<SsdpOptions>>().Value;
        return new SsdpSearchEnumerator(UpnpServices.RootDevice,
            new RepeatPolicyBuilder()
                .WithExponentialInterval(2, options.SearchIntervalSeconds)
                .WithJitter(500, 1000)
                .Build(),
            ep => SocketBuilderExtensions
                .CreateUdp(ep.AddressFamily)
                .ConfigureMulticast(options.MulticastInterfaceIndex, options.MulticastTTL)
                .JoinMulticastGroup(ep));
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
    }
}