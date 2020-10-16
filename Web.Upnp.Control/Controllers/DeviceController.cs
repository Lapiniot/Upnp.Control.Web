using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Routing;
using static IoT.Protocol.Upnp.UpnpServices;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/devices")]
    [Produces("application/json")]
    public class DeviceController : ControllerBase
    {
        private static readonly IDictionary<string, Expression<Func<Device, bool>>> Filters = new Dictionary<string, Expression<Func<Device, bool>>>
        {
            {"umi", d => d.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema)},
            {"upnp", d => true},
            {"servers", d => d.DeviceType == MediaServer || d.Services.Any(s => s.ServiceType == ContentDirectory || s.ServiceType == PlaylistService.ServiceSchema)},
            {"renderers", d => d.DeviceType == MediaRenderer || d.Services.Any(s => s.ServiceType == MediaRenderer)}
        };

        private readonly UpnpDbContext context;

        public DeviceController(UpnpDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async IAsyncEnumerable<Device> GetAllAsync([FromRouteOrQuery] string category = "upnp",
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            await foreach(var device in GetQuery(category).AsAsyncEnumerable().WithCancellation(cancellationToken).ConfigureAwait(false))
            {
                yield return device;
            }
        }

        [HttpGet("{id}")]
        public Task<Device> GetAsync(string id, [FromRouteOrQuery] string category = "upnp", CancellationToken cancellationToken = default)
        {
            return GetQuery(category).FirstOrDefaultAsync(d => d.Udn == id, cancellationToken);
        }

        private IQueryable<Device> GetQuery(string category)
        {
            return Filters.TryGetValue(category, out var filterExpression)
                ? GetQuery(filterExpression)
                : throw new ArgumentException($"Unknown device category filter '{category}'");
        }

        private IQueryable<Device> GetQuery(Expression<Func<Device, bool>> filter)
        {
            return context.UpnpDevices
                .Include(d => d.Icons).Include(d => d.Services)
                .Where(d => d.ExpiresAt > DateTime.UtcNow).Where(filter);
        }
    }
}