#region usings

using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.HttpOverrides;
using OOs.Extensions.Hosting;
using Scalar.AspNetCore;
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

var builder = WebApplication.CreateSlimBuilder(new WebApplicationOptions() { Args = args });

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

var appDbConnectionString = builder.Configuration.GetConnectionString("UpnpDeviceDb")
    ?? throw new InvalidOperationException("Connection string 'UpnpDeviceDb' not found.");

var pushSubscriptionDbConnectionString = builder.Configuration.GetConnectionString("PushSubscriptionDb")
    ?? throw new InvalidOperationException("Connection string 'PushSubscriptionDb' not found.");

builder.Services
    .AddServicesInit()
    .AddCertificateGenInitializer()
    .AddWebPushSender()
    .AddUpnpEventsSubscription(o => o.MapRenderingControl("api/events/{0}/rc").MapAVTransport("api/events/{0}/avt"))
    .AddUpnpDiscovery()
    .AddUpnpDeviceSqliteDatabase(appDbConnectionString)
    .AddPushSubscriptionSqliteDatabase(pushSubscriptionDbConnectionString)
    .AddSignalRUpnpDiscoveryNotifications()
    .AddSignalRUpnpEventNotifications()
    .AddBase64Encoders()
    .AddServerAddressesProvider()
    .AddUpnpServiceFactory()
    .AddQueries()
    .AddCommands();

builder.Services.ConfigureWebPushJsonOptions(static options => options.SerializerOptions.ConfigureApiDefaults());

#endregion

#region ASPNET configuration

builder.WebHost.UseKestrelHttpsConfiguration();

builder.Services.ConfigureHttpJsonOptions(static options =>
{
    options.SerializerOptions.ConfigureApiDefaults();
    options.SerializerOptions.TypeInfoResolverChain.Add(JsonContext.Default);
});

builder.Services.AddProblemDetails();

#endregion

#region SignalR configuration

#pragma warning disable IL2026
builder.Services.AddSignalR().AddJsonProtocol(static options => options.PayloadSerializerOptions.ConfigureApiDefaults());
#pragma warning restore IL2026

#endregion

#region Middleware configuration

builder.Services
    .AddResponseCaching()
    .AddImageLoaderProxyMiddleware()
    .AddContentProxyMiddleware();

#endregion

#region OpenAPI configuration

builder.Services
    .AddEndpointsApiExplorer()
    .AddOpenApi();

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

    // This is technically a workaround to make tools like Scalar working 
    // and correctly display API endpoints for requests coming 
    // through proxy (Vite's development server proxy for SPA e.g.)
    app.UseForwardedHeaders(new()
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedHost | ForwardedHeaders.XForwardedProto
    });
}

app.UseStaticFiles();
app.UseResponseCaching();

// Custom middleware endpoints
app.MapUpnpEventsHub("upnpevents");
app.MapImageLoaderProxy("proxy/{*url}");
app.MapContentProxy("dlna-proxy/{*url}");

var api = app.MapGroup("api");
// Custom services endpoints
api.MapCertificateDownload("cert").ExcludeFromDescription();
// Health checks
api.MapHealthChecks("health").ExcludeFromDescription();
// OpenAPI endpoint
api.MapOpenApi();
// ScalarUI endpoint
api.MapScalarApiReference(options => options
    .WithTitle($"{app.Environment.ApplicationName} Server API")
    .WithOpenApiRoutePattern("api/openapi/v1.json")
    .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient)
    .DisableMcp());

// API routes
var devicesApi = api.MapGroup("devices");
devicesApi.MapDevicesApi("");
devicesApi.MapBrowseContentApi("{deviceId}/items/{*path}");
devicesApi.MapSearchContentApi("{deviceId}/search/{*path}");
devicesApi.MapSearchCapabilitiesApi("{deviceId}/search-capabilities");
devicesApi.MapPlaylistApi("{deviceId}/playlists");
devicesApi.MapQueueApi("{deviceId}/queues/{queueId}/items");
devicesApi.MapControlApi("{deviceId}");
devicesApi.MapConnectionsApi("{deviceId}");

api.MapUpnpEventCallbacks("events/{deviceId}");
api.MapPushNotificationSubscriptionApi("push-subscriptions");
api.MapAppInfo("info");

// Fallback route
app.MapFallbackToFile("index.html");

#endregion

await app.RunAsync().ConfigureAwait(false);