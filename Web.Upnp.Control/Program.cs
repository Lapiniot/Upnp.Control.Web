using System;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control;

[assembly: CLSCompliant(false)]

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

await Host
    .CreateDefaultBuilder(args)
    .ConfigureAppConfiguration((ctx, cb) => cb
        .AddJsonFile($"appsettings.{ctx.HostingEnvironment.EnvironmentName}.Https.json", true)
        .AddJsonFile($"appsettings.Secrets.json", true, true))
    .ConfigureWebHostDefaults(whb => whb.UseStartup<Startup>())
    .UseWindowsService()
    .UseSystemd()
    .Build()
    .RunAsync()
    .ConfigureAwait(false);