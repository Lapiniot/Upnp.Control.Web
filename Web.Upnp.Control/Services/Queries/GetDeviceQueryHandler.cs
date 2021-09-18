using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using IoT.Device.Xiaomi.Umi.Services;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

using static IoT.Protocol.Upnp.UpnpServices;

namespace Web.Upnp.Control.Services.Queries;

public sealed class GetDeviceQueryHandler : IAsyncEnumerableQueryHandler<GetDevicesQuery, UpnpDevice>, IAsyncQueryHandler<GetDeviceQuery, UpnpDevice>
{
    private static readonly IDictionary<string, Expression<Func<UpnpDevice, bool>>> Filters = new Dictionary<string, Expression<Func<UpnpDevice, bool>>>
        {
            {"umi", d => d.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema)},
            {"upnp", d => true},
            {"servers", d => d.DeviceType == MediaServer || d.Services.Any(s => s.ServiceType == ContentDirectory || s.ServiceType == PlaylistService.ServiceSchema)},
            {"renderers", d => d.DeviceType == MediaRenderer || d.Services.Any(s => s.ServiceType == MediaRenderer)}
        };

    private readonly UpnpDbContext context;

    public GetDeviceQueryHandler(UpnpDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        this.context = context;
    }

    public async IAsyncEnumerable<UpnpDevice> ExecuteAsync(GetDevicesQuery query, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        await foreach(var device in GetQuery(query.Category).AsAsyncEnumerable().WithCancellation(cancellationToken).ConfigureAwait(false))
        {
            yield return device;
        }
    }

    public Task<UpnpDevice> ExecuteAsync(GetDeviceQuery query, CancellationToken cancellationToken)
    {
        return GetQuery("upnp").FirstOrDefaultAsync(d => d.Udn == query.DeviceId, cancellationToken);
    }

    private IQueryable<UpnpDevice> GetQuery(string category)
    {
        return Filters.TryGetValue(category, out var filterExpression)
            ? GetQuery(filterExpression)
            : throw new ArgumentException($"Unknown device category filter '{category}'");
    }

    private IQueryable<UpnpDevice> GetQuery(Expression<Func<UpnpDevice, bool>> filter)
    {
        return context.UpnpDevices
            .Include(d => d.Icons).Include(d => d.Services)
            .Where(d => d.ExpiresAt > DateTime.UtcNow).Where(filter);
    }
}