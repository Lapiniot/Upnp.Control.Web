using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using IoT.Device.Xiaomi.Umi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models;
using static IoT.Protocol.Upnp.UpnpServices;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/[controller]/{filter?}")]
    [Produces("application/json")]
    public class DiscoveryController : ControllerBase
    {
        private static readonly IDictionary<string, Expression<Func<Device, bool>>> Filters = new Dictionary<string, Expression<Func<Device, bool>>>
        {
            {"umi", d => d.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema)},
            {"upnp", d => true},
            {"servers", d => d.DeviceType == MediaServer || d.Services.Any(s => s.ServiceType == ContentDirectory || s.ServiceType == PlaylistService.ServiceSchema)},
            {"renderers", d => d.DeviceType == MediaRenderer || d.Services.Any(s => s.ServiceType == MediaRenderer)}
        };

        private readonly UpnpDbContext context;

        public DiscoveryController(UpnpDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public IAsyncEnumerable<Device> GetAsync(string filter = "upnp")
        {
            return Filters.TryGetValue(filter, out var filterExpression)
                ? QueryAsync(filterExpression)
                : throw new ArgumentException($"Unknown device category filter '{filter}'");
        }

        private IAsyncEnumerable<Device> QueryAsync(Expression<Func<Device, bool>> filter)
        {
            return context.UpnpDevices
                .Include(d => d.Icons).Include(d => d.Services)
                .Where(d => d.ExpiresAt > DateTime.UtcNow).Where(filter)
                .AsAsyncEnumerable();
        }
    }
}