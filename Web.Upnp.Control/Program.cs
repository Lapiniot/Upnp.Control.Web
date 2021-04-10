﻿using System;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control;
using Web.Upnp.Control.Services;

[assembly: CLSCompliant(false)]

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

await Host.CreateDefaultBuilder(args)
    .ConfigureWebHostDefaults(webHostBuilder => webHostBuilder
        .ConfigureAppConfiguration((ctx, cb) => cb
            .AddJsonFile($"appsettings.{ctx.HostingEnvironment.EnvironmentName}.Https.json", true)
            .AddJsonFile($"appsettings.Secrets.json", true, true))
        .UseStartup<Startup>()
        .UseKestrel()
        .UseSockets())
    .ConfigureServices(services => services.AddHostedService<UpnpDiscoveryService>())
    .UseWindowsService()
    .UseSystemd()
    .Build()
    .RunAsync()
    .ConfigureAwait(false);