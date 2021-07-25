using System;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control;
using Web.Upnp.Control.Services;

[assembly: CLSCompliant(false)]

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

var hostBuilder = Host
    .CreateDefaultBuilder(args)
    .ConfigureAppConfiguration((ctx, cb) =>
    {
        var sources = cb.Sources;
        var index = sources.IndexOf(sources.Last(s => s is JsonConfigurationSource)) + 1;
        var environmentName = ctx.HostingEnvironment.EnvironmentName;
        sources.Insert(index, new JsonConfigurationSource() { Path = "config/appsettings.Secrets.json", Optional = true, ReloadOnChange = true });
        sources.Insert(index, new JsonConfigurationSource() { Path = $"config/appsettings.{environmentName}.Https.json", Optional = true });
        sources.Insert(index, new JsonConfigurationSource() { Path = $"config/appsettings.{environmentName}.json", Optional = true });
        sources.Insert(index, new JsonConfigurationSource() { Path = $"appsettings.Secrets.json", Optional = true, ReloadOnChange = true });
        sources.Insert(index, new JsonConfigurationSource() { Path = $"appsettings.{environmentName}.Https.json", Optional = true });
    })
    .ConfigureWebHostDefaults(whb => whb.UseStartup<Startup>())
    .ConfigureServices(cd => cd.AddHostedService<UpnpDiscoveryService>());

if(OperatingSystem.IsLinux())
{
    hostBuilder = hostBuilder.UseSystemd();
}
else if(OperatingSystem.IsWindows())
{
    hostBuilder = hostBuilder.UseWindowsService();
}

await hostBuilder.Build().RunAsync().ConfigureAwait(false);