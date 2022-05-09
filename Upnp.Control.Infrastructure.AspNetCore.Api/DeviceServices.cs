using System.Diagnostics.CodeAnalysis;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class DeviceServices
{
    /// <summary>
    /// Provides the list of all available UPnP devices that belong to the <paramref name="category" />
    /// </summary>
    /// <param name="handler">Query implementation</param>
    /// <param name="category">Device category filter</param>
    /// <param name="withOffline">Include offline devices</param>
    /// <param name="cancellationToken">Request cancellation token</param>
    /// <returns>Device information enumerator</returns>
    public static IAsyncEnumerable<UpnpDevice> GetAllAsync([NotNull] IAsyncEnumerableQueryHandler<GetDevicesQuery, UpnpDevice> handler,
        string category = "upnp", bool withOffline = false, CancellationToken cancellationToken = default) =>
        handler.ExecuteAsync(new GetDevicesQuery(category, withOffline), cancellationToken);

    /// <summary>
    /// Provides information about UPnP device with <paramref name="id" /> unique id
    /// </summary>
    /// <param name="handler">Query implementation</param>
    /// <param name="id">Device id</param>
    /// <param name="cancellationToken">Request cancellation token</param>
    /// <returns>Device information</returns>
    public static Task<UpnpDevice> GetAsync([NotNull] IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler,
        string id, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new GetDeviceQuery(id), cancellationToken);
}