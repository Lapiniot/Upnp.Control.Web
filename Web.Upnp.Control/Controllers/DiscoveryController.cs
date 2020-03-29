using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using static IoT.Device.Xiaomi.Umi.Services.PlaylistService;
using static IoT.Protocol.Upnp.UpnpServices;


namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/[controller]/{filter?}")]
    [Produces("application/json")]
    public class DiscoveryController : ControllerBase
    {
        private static readonly IDictionary<string, Expression<Func<Device, bool>>> filters = new Dictionary<string, Expression<Func<Device, bool>>>
        {
            {"umi", d => d.Services.Any(s => s.ServiceType == ServiceSchema)},
            {"upnp", d => true},
            {
                "servers", d => d.DeviceType == MediaServer ||
                                d.Services.Any(s => s.ServiceType == ContentDirectory || s.ServiceType == ServiceSchema)
            },
            {
                "renderers", d => d.DeviceType == MediaRenderer ||
                                  d.Services.Any(s => s.ServiceType == MediaRenderer)
            }
        };

        private readonly UpnpDbContext context;

        public DiscoveryController(UpnpDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<Device[]> GetAsync(string filter = "upnp")
        {
            return filters.TryGetValue(filter, out var filterExpression)
                ? await QueryAsync(filterExpression)
                : throw new ArgumentException("Unknown device category filter '" + filter + "'");
        }

        private Task<Device[]> QueryAsync(Expression<Func<Device, bool>> filter)
        {
            return context.UpnpDevices
                .Include(d => d.Icons)
                .Include(d => d.Services)
                .Where(d => d.IsOnline)
                .Where(filter)
                .ToArrayAsync();
        }
    }
}