#region usings
using System.Reflection;
using Upnp.Control.DataAccess.Configuration;
using Upnp.Control.Infrastructure.AspNetCore.Api;
using Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;
using Upnp.Control.Infrastructure.AspNetCore.Configuration;
using Upnp.Control.Infrastructure.Configuration;
using Upnp.Control.Infrastructure.PushNotifications.Configuration;
using Upnp.Control.Infrastructure.SignalR.Configuration;
using Upnp.Control.Infrastructure.Upnp.Configuration;
using Upnp.Control.Infrastructure.UpnpDiscovery.Configuration;
using Upnp.Control.Infrastructure.UpnpEvents.Configuration;
using Upnp.Control.Models.Converters;
using Upnp.Control.Services.Commands.Configuration;
using Upnp.Control.Services.Queries.Configuration;
using JsonOptions = Microsoft.AspNetCore.Http.Json.JsonOptions;
#endregion

#pragma warning disable CA1812 // False warning due to the bug in the rule's analyzer

IoT.Device.Upnp.Library.Init();
IoT.Device.Upnp.Umi.Library.Init();

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

var builder = WebApplication.CreateBuilder(args);

#region Application configuration

builder.Host.ConfigureAppConfiguration((ctx, cb) => cb
    .AddJsonFile("config/appsettings.json", true, true)
    .AddJsonFile($"config/appsettings.{ctx.HostingEnvironment.EnvironmentName}.json", true, true)
    .AddJsonFile("config/appsettings.Secrets.json", true, true)
    .AddEnvironmentVariables("UPNP_DASHBOARD_"));

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
    .AddWebPushSender(static options => options.ConfigureDefaults())
    .AddUpnpEventsSubscription(o => o.MapRenderingControl("api/events/{0}/rc").MapAVTransport("api/events/{0}/avt"))
    .AddUpnpDiscovery()
    .AddUpnpDeviceSqliteDatabase(Path.Combine(builder.Environment.ContentRootPath, "data/upnp.db3"))
    .AddPushSubscriptionSqliteDatabase(Path.Combine(builder.Environment.ContentRootPath, "data/subscriptions.db3"))
    .AddSignalRUpnpDiscoveryNotifications()
    .AddSignalRUpnpEventNotifications()
    .AddBase64Encoders()
    .AddServerAddressesProvider()
    .AddUpnpServiceFactory()
    .AddQueries()
    .AddCommands();

#endregion

#region ASPNET MVC configuration

builder.Services
    .AddControllers(options => options
        .AddBinaryContentFormatter()
        .AddRequestCancelledExceptionFilter())
    .AddJsonOptions(static options => options.JsonSerializerOptions.ConfigureDefaults());

builder.Services.Configure<JsonOptions>(static options => options.SerializerOptions.ConfigureDefaults());

#endregion

#region SignalR configuration

builder.Services.AddSignalR().AddJsonProtocol(static options => options.PayloadSerializerOptions.ConfigureDefaults());

#endregion

#region Middleware configuration

builder.Services
    .AddResponseCaching()
    .AddImageLoaderProxyMiddleware()
    .AddContentProxyMiddleware()
    .AddCertificateDownloadMiddleware();

#endregion

#region Swagger configuration

builder.Services
    .AddEndpointsApiExplorer()
    .AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new() { Version = "v1", Title = "UPnP Control Dashboard" });
        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, $"{Assembly.GetExecutingAssembly().GetName().Name}.xml"));
        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, $"{typeof(DeviceServices).Assembly.GetName().Name}.xml"));
    });

#endregion

#region Health checks configuration

builder.Services.AddHealthChecks();

#endregion

var app = builder.Build();

#region WebApplication specific configuration

app.UseStaticFiles();
app.UseResponseCaching();
app.UseSwaggerUI(options =>
{
    options.RoutePrefix = "api/swagger";
    options.SwaggerEndpoint("/api/swagger/v1/swagger.json", "UPnP Control Dashboard API v1");
});

app.MapDefaultControllerRoute();
// Custom middleware endpoints
app.MapUpnpEventsHub("upnpevents");
app.MapImageLoaderProxy("proxy/{*url}");
app.MapContentProxy("dlna-proxy/{*url}");
app.MapCertificateDownloadMiddleware("api/cert");
// Health checks
app.MapHealthChecks("api/health");
// API routes
var api = app.MapGroup("api/devices").WithGroupName("v1");
api.MapDeviceApiEndpoint("");
api.MapBrowseContentApiEndpoint("{deviceId}/items/{*path}");
// Swagger
app.MapSwagger("api/swagger/{documentName}/swagger.json");
// Fallback route
app.MapFallbackToFile("index.html");

#endregion

await app.RunAsync().ConfigureAwait(false);