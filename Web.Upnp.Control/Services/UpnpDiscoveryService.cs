﻿using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using static IoT.Protocol.Upnp.UpnpServices;

namespace Web.Upnp.Control.Services
{
    public class UpnpDiscoveryService : BackgroundService
    {
        public UpnpDiscoveryService(IServiceProvider services)
        {
            Services = services;
        }

        public IServiceProvider Services { get; }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var enumerator = new UpnpDeviceEnumerator(TimeSpan.FromSeconds(30), RootDevice);

            using(var scope = Services.CreateScope())
            using(var context = scope.ServiceProvider.GetRequiredService<UpnpDbContext>())
            {
                await enumerator.DiscoverAsync(DiscoveredAsync, context, stoppingToken);
            }
        }

        private async Task DiscoveredAsync(UpnpDevice dev, UpnpDbContext ctx, CancellationToken cancellationToken)
        {
            var description = await dev.GetDescriptionAsync(cancellationToken).ConfigureAwait(false);

            var entity = new Device
            {
                Udn = description.Udn,
                Location = description.Location.AbsoluteUri,
                DeviceType = description.DeviceType,
                FriendlyName = description.FriendlyName,
                Manufacturer = description.Manufacturer,
                Description = description.ModelDescription,
                ModelName = description.ModelName,
                ModelNumber = description.ModelNumber,
                IsOnline = true,
                Icons = description.Icons.Select(i => new Icon
                {
                    Width = i.Width,
                    Height = i.Height,
                    Mime = i.Mime,
                    Url = i.Uri.AbsoluteUri
                }).ToList(),
                Services = description.Services.Select(s => new Service
                {
                    ServiceId = s.ServiceId,
                    ServiceType = s.ServiceType,
                    MetadataUrl = s.MetadataUri.AbsoluteUri,
                    ControlUrl = s.ControlUri.AbsoluteUri
                }).ToList()
            };

            await ctx.AddAsync(entity, cancellationToken).ConfigureAwait(false);
            await ctx.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}