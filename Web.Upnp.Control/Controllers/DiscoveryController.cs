using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]/{filter?}")]
    public class DiscoveryController : Controller
    {
        private static IDictionary<string, Expression<Func<Device, bool>>> filters = new Dictionary<string, Expression<Func<Device, bool>>>()
        {
            {"umi", d => d.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema)},
            {"upnp", d => true},
            {"media_servers", d => d.DeviceType == UpnpServices.MediaServer ||
                d.Services.Any(s => s.ServiceType == UpnpServices.ContentDirectory ||
                    s.ServiceType == PlaylistService.ServiceSchema)},
            {"media_renderers",d => d.DeviceType == UpnpServices.MediaRenderer ||
                    d.Services.Any(s => s.ServiceType == UpnpServices.MediaRenderer)}
        };

        private readonly UpnpDbContext context;

        public DiscoveryController(UpnpDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public Task<Device[]> GetAsync(string filter = "upnp")
        {
            return filters.TryGetValue(filter, out var filterExpression) ? QueryAsync(filterExpression) :
                throw new ArgumentException("Unknown device category filter '" + filter + "'");
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