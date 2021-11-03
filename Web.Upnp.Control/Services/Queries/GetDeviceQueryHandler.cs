using System.Linq.Expressions;
using IoT.Device.Upnp.Umi.Services;
using Upnp.Control.Models;
using Upnp.Control.Services;
using Web.Upnp.Control.Models;

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
            ? repository.EnumerateAsync(filter, cancellationToken)
            : throw new ArgumentException($"Unknown device category filter '{query.Category}'");
    }

    public Task<UpnpDevice> ExecuteAsync(GetDeviceQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        return repository.FindAsync(query.DeviceId, cancellationToken);
    }
}