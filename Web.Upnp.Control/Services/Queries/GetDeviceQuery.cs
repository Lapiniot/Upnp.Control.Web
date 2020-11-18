using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static IoT.Protocol.Upnp.UpnpServices;

namespace Web.Upnp.Control.Services.Queries
{
    public class GetDeviceQuery : IAsyncEnumerableQuery<GetDevicesQueryParams, Device>, IAsyncQuery<GetDeviceQueryParams, Device>
    {
        private static readonly IDictionary<string, Expression<Func<Device, bool>>> Filters = new Dictionary<string, Expression<Func<Device, bool>>>
        {
            {"umi", d => d.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema)},
            {"upnp", d => true},
            {"servers", d => d.DeviceType == MediaServer || d.Services.Any(s => s.ServiceType == ContentDirectory || s.ServiceType == PlaylistService.ServiceSchema)},
            {"renderers", d => d.DeviceType == MediaRenderer || d.Services.Any(s => s.ServiceType == MediaRenderer)}
        };

        private readonly UpnpDbContext context;

        public GetDeviceQuery(UpnpDbContext context)
        {
            this.context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async IAsyncEnumerable<Device> ExecuteAsync(GetDevicesQueryParams queryParameters,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            await foreach(var device in GetQuery(queryParameters.Category).AsAsyncEnumerable().WithCancellation(cancellationToken).ConfigureAwait(false))
            {
                yield return device;
            }
        }

        public Task<Device> ExecuteAsync(GetDeviceQueryParams queryParameters, CancellationToken cancellationToken)
        {
            return GetQuery("upnp").FirstOrDefaultAsync(d => d.Udn == queryParameters.DeviceId, cancellationToken);
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