#region usings
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration.Json;
using Upnp.Control.DataAccess.Configurations;
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
#endregion

#pragma warning disable CA1812 // False warning due to the bug in the rule's analyzer

IoT.Device.Upnp.Library.Init();
IoT.Device.Upnp.Umi.Library.Init();

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

var builder = WebApplication.CreateBuilder(args);

#region JSON configuration

var customConverters = new JsonConverter[]
{
    new IconJsonConverter(), new ServiceJsonConverter(), new DeviceJsonConverter(), new ItemJsonConverter(),
    new ResourceJsonConverter(), new ContainerJsonConverter(), new MediaItemJsonConverter(), new CDContentConverter()
};

void ConfigureJsonSerializer(JsonSerializerOptions options)
{
    options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;

    foreach(var converter in customConverters)
    {
        options.Converters.Add(converter);
    }

    options.AddContext<JsonContext>();
}

#endregion

#region Services configuration

builder.Services.AddServicesInit()
    .AddWebPushSender(ConfigureJsonSerializer)
    .AddUpnpEventsSubscription(o => o.MapRenderingControl("api/events/{0}/rc").MapAVTransport("api/events/{0}/avt"))
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

builder.Services.AddControllers(options => options.AddBinaryContentFormatter().AddRequestCancelledExceptionFilter())
    .AddJsonOptions(options => ConfigureJsonSerializer(options.JsonSerializerOptions));

#endregion

#region SignalR configuration

builder.Services.AddSignalR().AddJsonProtocol(options => ConfigureJsonSerializer(options.PayloadSerializerOptions));

#endregion

#region Middleware configuration

builder.Services
    .AddResponseCaching()
    .AddImageLoaderProxyMiddleware()
    .AddContentProxyMiddleware()
    .AddCertificateDownloadMiddleware();

#endregion

#region Swagger configuration

builder.Services.AddSwaggerGen(c =>
{
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

#endregion

#region Health checks configuration

builder.Services.AddHealthChecks();

#endregion

#region Application configuration

builder.Host.ConfigureAppConfiguration((ctx, cb) =>
{
    var sources = cb.Sources;
    var index = sources.IndexOf(sources.Last(s => s is JsonConfigurationSource)) + 1;
    var environmentName = ctx.HostingEnvironment.EnvironmentName;
    sources.Insert(index, new JsonConfigurationSource() { Path = "config/appsettings.Secrets.json", Optional = true, ReloadOnChange = true });
    sources.Insert(index, new JsonConfigurationSource() { Path = $"config/appsettings.{environmentName}.Https.json", Optional = true });
    sources.Insert(index, new JsonConfigurationSource() { Path = $"config/appsettings.{environmentName}.json", Optional = true });
    sources.Insert(index, new JsonConfigurationSource() { Path = $"appsettings.Secrets.json", Optional = true, ReloadOnChange = true });
    sources.Insert(index, new JsonConfigurationSource() { Path = $"appsettings.{environmentName}.Https.json", Optional = true });
});

builder.Host.ConfigureServices(cd => cd.AddUpnpDiscovery());

#endregion

#region Platform specific host lifetime configuration

if(OperatingSystem.IsLinux())
{
    builder.Host.UseSystemd();
}
else if(OperatingSystem.IsWindows())
{
    builder.Host.UseWindowsService();
}

#endregion

var app = builder.Build();

#region WebApplication specific configuration

app.UseStaticFiles();
app.UseResponseCaching();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/api/swagger/v1/swagger.json", "UPnP Control API V1");
    options.RoutePrefix = "api/swagger";
});

app.MapDefaultControllerRoute();
app.MapUpnpEventsHub("upnpevents");
app.MapImageLoaderProxy("proxy/{*url}");
app.MapContentProxy("dlna-proxy/{*url}");
app.MapHealthChecks("api/health");
app.MapCertificateDownloadMiddleware("api/cert");
app.MapSwagger("api/swagger/{documentName}/swagger.json");

#endregion

await app.RunAsync().ConfigureAwait(false);