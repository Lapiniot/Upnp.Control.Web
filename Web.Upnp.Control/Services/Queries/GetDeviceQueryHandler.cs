using System.Linq.Expressions;
using IoT.Device.Upnp.Umi.Services;
using Upnp.Control.Models;
using Upnp.Control.Services;
using Web.Upnp.Control.Models;

using static IoT.Protocol.Upnp.UpnpServices;
using static System.DateTime;
using static System.Linq.Expressions.Expression;

namespace Web.Upnp.Control.Services.Queries;

public sealed class GetDeviceQueryHandler : IAsyncEnumerableQueryHandler<GetDevicesQuery, UpnpDevice>, IAsyncQueryHandler<GetDeviceQuery, UpnpDevice>
{
    private static readonly IDictionary<string, Expression<Func<UpnpDevice, bool>>> Filters = new Dictionary<string, Expression<Func<UpnpDevice, bool>>>
    {
        {"umi", d => d.ExpiresAt > UtcNow && d.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema)},
        {"upnp", d => d.ExpiresAt > UtcNow},
        {"servers", d => d.ExpiresAt > UtcNow && (d.DeviceType == MediaServer || d.Services.Any(s => s.ServiceType == ContentDirectory || s.ServiceType == PlaylistService.ServiceSchema))},
        {"renderers", d => d.ExpiresAt > UtcNow && (d.DeviceType == MediaRenderer || d.Services.Any(s => s.ServiceType == MediaRenderer))}
    };
    private readonly IUpnpDeviceRepository repository;

    public GetDeviceQueryHandler(IUpnpDeviceRepository repository)
    {
        ArgumentNullException.ThrowIfNull(repository);

        this.repository = repository;
    }

    public IAsyncEnumerable<UpnpDevice> ExecuteAsync(GetDevicesQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        return Filters.TryGetValue(query.Category, out var filter)
            ? repository.EnumerateAsync(BuildCondition(filter, query.WithOffline), cancellationToken)
            : throw new ArgumentException($"Unknown device category filter '{query.Category}'");
    }

    public Task<UpnpDevice> ExecuteAsync(GetDeviceQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        return repository.FindAsync(query.DeviceId, cancellationToken);
    }

    private static Expression<Func<UpnpDevice, bool>> BuildCondition(Expression<Func<UpnpDevice, bool>> filter, bool withOffline)
    {
        return withOffline && filter is LambdaExpression { Body: { } body, Parameters: { } @params }
            ? body is BinaryExpression { NodeType: ExpressionType.AndAlso, Right: { } right }
                ? Lambda<Func<UpnpDevice, bool>>(right, true, @params)
                : Lambda<Func<UpnpDevice, bool>>(Constant(true), true, @params)
            : filter;
    }
}