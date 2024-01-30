using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using static IoT.Protocol.Upnp.UpnpServices;
using static System.DateTime;

namespace Upnp.Control.DataAccess.Queries;

internal sealed class GetDeviceQueryHandler(UpnpDbContext context) :
    IAsyncEnumerableQueryHandler<GetDevicesQuery, UpnpDevice>,
    IAsyncQueryHandler<GetDeviceQuery, UpnpDevice>
{
    private const string UmiPlaylistSchema = "urn:xiaomi-com:service:Playlist:1";

    private static readonly Func<UpnpDbContext, string, CancellationToken, Task<UpnpDevice>> GetDeviceByUdnQuery =
        EF.CompileAsyncQuery((UpnpDbContext ctx, string udn, CancellationToken ct) =>
            ctx.UpnpDevices.AsNoTracking().FirstOrDefault(d => d.Udn == udn));

    private static readonly Dictionary<string, Func<UpnpDbContext, bool, IAsyncEnumerable<UpnpDevice>>> GetDevicesInCategoryQueries = new()
    {
        { "umi", CompileQuery(d => d.Services.Any(s => s.ServiceType == UmiPlaylistSchema)) },
        { "upnp", CompileQuery(d => true) },
        { "servers", CompileQuery(d => d.DeviceType == MediaServer || d.Services.Any(s => s.ServiceType == ContentDirectory || s.ServiceType == UmiPlaylistSchema)) },
        { "renderers", CompileQuery(d => d.DeviceType == MediaRenderer || d.Services.Any(s => s.ServiceType == MediaRenderer)) }
    };

    private static Func<UpnpDbContext, bool, IAsyncEnumerable<UpnpDevice>> CompileQuery(Expression<Func<UpnpDevice, bool>> predicate) =>
        EF.CompileAsyncQuery((UpnpDbContext ctx, bool withOffline) =>
            ctx.UpnpDevices.AsNoTracking().Where(d => withOffline || d.ExpiresAt > UtcNow).Where(predicate));

    public async IAsyncEnumerable<UpnpDevice> ExecuteAsync(GetDevicesQuery query, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var (category, withOffline) = query;

        if (!GetDevicesInCategoryQueries.TryGetValue(category, out var getDevicesQuery))
        {
            ThrowInvalidCategory(category);
        }

        await foreach (var device in getDevicesQuery(context, withOffline).WithCancellation(cancellationToken).ConfigureAwait(false))
        {
            yield return device;
        }
    }

    public async Task<UpnpDevice> ExecuteAsync(GetDeviceQuery query, CancellationToken cancellationToken) =>
        await GetDeviceByUdnQuery(context, query.DeviceId, cancellationToken).ConfigureAwait(false);

    [DoesNotReturn]
    private static void ThrowInvalidCategory(string category) =>
        throw new InvalidOperationException($"Unknown device category filter '{category}'");
}