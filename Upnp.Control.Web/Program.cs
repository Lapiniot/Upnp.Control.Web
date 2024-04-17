#region usings

using OOs.Extensions.Hosting;
using System.Reflection;
using System.Text;
using Upnp.Control.DataAccess.Configuration;
using Upnp.Control.Infrastructure.AspNetCore;
using Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;
using Upnp.Control.Infrastructure.AspNetCore.Configuration;
using Upnp.Control.Infrastructure.PushNotifications.Configuration;
using Upnp.Control.Infrastructure.SignalR.Configuration;
using Upnp.Control.Infrastructure.Upnp.Configuration;
using Upnp.Control.Infrastructure.UpnpDiscovery.Configuration;
using Upnp.Control.Infrastructure.UpnpEvents.Configuration;
using Upnp.Control.Services.Commands.Configuration;
using Upnp.Control.Services.Queries.Configuration;

#endregion

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

var builder = WebApplication.CreateSlimBuilder(new WebApplicationOptions() { Args = args, ApplicationName = "upnp-dashboard" });

var dataDirectory = builder.Environment.GetAppDataPath();
var configDirectory = builder.Environment.GetAppConfigPath();

#region Application configuration

builder.Configuration
    .AddJsonFile(Path.Combine(configDirectory, "appsettings.json"), true, true)
    .AddJsonFile(Path.Combine(configDirectory, $"appsettings.{builder.Environment.EnvironmentName}.json"), true, true)
    .AddJsonFile(Path.Combine(configDirectory, "appsettings.Secrets.json"), true, true)
    .AddEnvironmentVariables("UPNP_DASHBOARD_");

#region Platform specific host lifetime configuration

if (OperatingSystem.IsLinux())
{
    builder.Host.UseSystemd();
}
else if (OperatingSystem.IsWindows())
{
    builder.Host.UseWindowsService();
}

#endregion

#endregion

#region Services configuration

builder.Services.AddServicesInit()
    .AddCertificateGenInitializer()
    .AddWebPushSender()
    .AddUpnpEventsSubscription(o => o.MapRenderingControl("api/events/{0}/rc").MapAVTransport("api/events/{0}/avt"))
    .AddUpnpDiscovery()
    .AddUpnpDeviceSqliteDatabase(Path.Combine(dataDirectory, "upnp.db3"))
    .AddPushSubscriptionSqliteDatabase(Path.Combine(dataDirectory, "subscriptions.db3"))
    .AddSignalRUpnpDiscoveryNotifications()
    .AddSignalRUpnpEventNotifications()
    .AddBase64Encoders()
    .AddServerAddressesProvider()
    .AddUpnpServiceFactory()
    .AddQueries()
    .AddCommands();

builder.Services.ConfigureWebPushJsonOptions(static options => options.SerializerOptions.ConfigureDefaults());

#endregion

#region ASPNET configuration

builder.WebHost.UseKestrelHttpsConfiguration();

builder.Services.ConfigureHttpJsonOptions(static options =>
{
    options.SerializerOptions.ConfigureDefaults();
    options.SerializerOptions.TypeInfoResolverChain.Add(JsonContext.Default);
});

builder.Services.AddProblemDetails();

#endregion

#region SignalR configuration

#pragma warning disable IL2026
builder.Services.AddSignalR().AddJsonProtocol(static options => options.PayloadSerializerOptions.ConfigureDefaults());
#pragma warning restore IL2026

#endregion

#region Middleware configuration

builder.Services
    .AddResponseCaching()
    .AddImageLoaderProxyMiddleware()
    .AddContentProxyMiddleware();

#endregion

#region Swagger configuration

builder.Services
    .AddEndpointsApiExplorer()
    .AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new() { Version = "v1", Title = "UPnP Control Dashboard" });
        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, $"{typeof(ConfigureExtensions).Assembly.GetName().Name}.xml"));
    });

#endregion

#region Health checks configuration

builder.Services.AddHealthChecks();

#endregion

#region Dynamic configuration via. Hosting Startup Assemblies

// This functionality is not supported by SlimBuilder, so we reimplement it here just 
// for the sake of dev. mode libraries integration (Microsoft.AspNetCore.SpaProxy e.g.)

if (builder.Environment.IsDevelopment() && builder.Configuration[WebHostDefaults.HostingStartupAssembliesKey]?
        .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) is { } startupAssemblies)
{
    foreach (var startupAssembly in startupAssemblies)
    {
        var assembly = Assembly.Load(startupAssembly);
        var type = assembly.GetCustomAttribute<HostingStartupAttribute>().HostingStartupType;
        var startup = (IHostingStartup)Activator.CreateInstance(type);
        startup.Configure(builder.WebHost);
    }
}

#endregion

var app = builder.Build();

#region WebApplication specific configuration

app.UseExceptionHandler();
app.UseStatusCodePages();
if (builder.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseStaticFiles();
app.UseResponseCaching();
app.UseSwaggerUI(options =>
{
    options.RoutePrefix = "api/swagger";
    options.SwaggerEndpoint("/api/swagger/v1/swagger.json", "UPnP Control Dashboard API v1");
});

// Custom middleware endpoints
app.MapUpnpEventsHub("upnpevents");
app.MapImageLoaderProxy("proxy/{*url}");
app.MapContentProxy("dlna-proxy/{*url}");
// Custom services endpoints
app.MapCertificateDownload("api/cert");
// Health checks
app.MapHealthChecks("api/health");

// API routes
var api = app.MapGroup("api/devices").WithGroupName("v1");
api.MapDevicesApi("");
api.MapBrowseContentApi("{deviceId}/items/{*path}");
api.MapSearchContentApi("{deviceId}/search/{*path}");
api.MapPlaylistApi("{deviceId}/playlists");
api.MapQueueApi("{deviceId}/queues/{queueId}/items");
api.MapControlApi("{deviceId}");
api.MapConnectionsApi("{deviceId}");

app.MapUpnpEventCallbacks("api/events/{deviceId}");
app.MapPushNotificationSubscriptionApi("api/push-subscriptions");
app.MapAppInfo("api/info");
// Swagger
app.MapSwagger("api/swagger/{documentName}/swagger.json");

// Fallback route
app.MapFallbackToFile("index.html");

#endregion

await app.RunAsync().ConfigureAwait(false);