using System;
using System.Collections.Generic;
using System.IO.Pipelines;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using static IoT.Protocol.Upnp.UpnpServices;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]/{filter?}")]
    [ApiController]
    public class DiscoveryController : ControllerBase
    {
        private static readonly IDictionary<string, Expression<Func<Device, bool>>> filters = new Dictionary<string, Expression<Func<Device, bool>>>
        {
            {"umi", d => d.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema)},
            {"upnp", d => true},
            {
                "media_servers", d => d.DeviceType == MediaServer ||
                                      d.Services.Any(s => s.ServiceType == ContentDirectory || s.ServiceType == PlaylistService.ServiceSchema)
            },
            {
                "media_renderers", d => d.DeviceType == MediaRenderer ||
                                        d.Services.Any(s => s.ServiceType == MediaRenderer)
            }
        };

        private readonly UpnpDbContext context;

        public DiscoveryController(UpnpDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task GetAsync(string filter = "upnp")
        {
            var devices = filters.TryGetValue(filter, out var filterExpression)
                ? await QueryAsync(filterExpression)
                : throw new ArgumentException("Unknown device category filter '" + filter + "'");
            var writer = HttpContext.Response.BodyWriter;

            WriteResponse(writer, devices);
            await writer.FlushAsync().ConfigureAwait(false);
        }

        private void WriteResponse(PipeWriter writer, Device[] devices)
        {
            ReadOnlySpan<char> udnProp = "udn";
            ReadOnlySpan<char> urlProp = "url";
            ReadOnlySpan<char> nameProp = "name";
            ReadOnlySpan<char> typeProp = "type";
            ReadOnlySpan<char> makerProp = "maker";
            ReadOnlySpan<char> modelProp = "model";
            ReadOnlySpan<char> descriptionProp = "description";
            ReadOnlySpan<char> idProp = "id";
            ReadOnlySpan<char> mimeProp = "mime";
            ReadOnlySpan<char> wProp = "w";
            ReadOnlySpan<char> hProp = "h";
            ReadOnlySpan<char> servicesProp = "services";
            ReadOnlySpan<char> iconsProp = "icons";
            ReadOnlySpan<char> onlineProp = "isOnline";

            var w = new Utf8JsonWriter(writer);
            w.WriteStartArray();
            foreach(var device in devices)
            {
                w.WriteStartObject();
                w.WriteString(udnProp, device.Udn);
                w.WriteString(urlProp, device.Location);
                w.WriteString(nameProp, device.FriendlyName);
                w.WriteString(typeProp, device.DeviceType);
                w.WriteString(makerProp, device.Manufacturer);
                w.WriteString(modelProp, device.ModelName);
                w.WriteString(descriptionProp, device.Description);
                w.WriteBoolean(onlineProp, device.IsOnline);

                if(device.Services != null && device.Services.Any())
                {
                    w.WriteStartArray(servicesProp);

                    foreach(var service in device.Services)
                    {
                        w.WriteStartObject();
                        w.WriteString(idProp, service.ServiceId);
                        w.WriteString(typeProp, service.ServiceType);
                        w.WriteString(urlProp, service.MetadataUrl);
                        w.WriteEndObject();
                    }

                    w.WriteEndArray();
                }

                if(device.Icons != null && device.Icons.Any())
                {
                    w.WriteStartArray(iconsProp);

                    foreach(var icon in device.Icons)
                    {
                        w.WriteStartObject();
                        w.WriteString(urlProp, icon.Url);
                        w.WriteString(mimeProp, icon.Mime);
                        w.WriteNumber(wProp, icon.Width);
                        w.WriteNumber(hProp, icon.Height);
                        w.WriteEndObject();
                    }

                    w.WriteEndArray();
                }

                w.WriteEndObject();
            }

            w.WriteEndArray();
            w.Flush();
        }

        private Task<Device[]> QueryAsync(Expression<Func<Device, bool>> filter)
        {
            return context.UpnpDevices
                .Include(d => d.Icons).Include(d => d.Services)
                .Where(d => d.IsOnline).Where(filter)
                .ToArrayAsync();
        }
    }
}