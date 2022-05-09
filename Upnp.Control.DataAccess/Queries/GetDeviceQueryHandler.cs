using System.Linq.Expressions;
using System.Runtime.CompilerServices;

using static IoT.Protocol.Upnp.UpnpServices;
using static System.DateTime;

namespace Upnp.Control.DataAccess.Queries;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class GetDeviceQueryHandler : IAsyncEnumerableQueryHandler<GetDevicesQuery, UpnpDevice>, IAsyncQueryHandler<GetDeviceQuery, UpnpDevice>
{
    private const string UmiPlaylistSchema = "urn:xiaomi-com:service:Playlist:1";

    private static readonly IDictionary<string, Expression<Func<UpnpDevice, bool>>> Filters = new Dictionary<string, Expression<Func<UpnpDevice, bool>>>
    {
        {"umi", d => d.Services.Any(s => s.ServiceType == UmiPlaylistSchema)},
        {"upnp", d => true},
        {"servers", d => d.DeviceType == MediaServer || d.Services.Any(s => s.ServiceType == ContentDirectory || s.ServiceType == UmiPlaylistSchema)},
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

        var (category, withOffline) = query;

        if (!Filters.TryGetValue(category, out var filter))
        {
            throw new InvalidOperationException($"Unknown device category filter '{category}'");
        }

        var queryable = context.UpnpDevices.AsNoTracking().Where(filter);

        if (!withOffline)
        {
            queryable = queryable.Where(d => d.ExpiresAt > UtcNow);
        }

        await foreach (var device in queryable.AsAsyncEnumerable().WithCancellation(cancellationToken).ConfigureAwait(false))
        {
            yield return device;
        }
    }

    public async Task<UpnpDevice> ExecuteAsync(GetDeviceQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        return await context.UpnpDevices.FindAsync(new object[] { query.DeviceId }, cancellationToken).ConfigureAwait(false);
    }
}