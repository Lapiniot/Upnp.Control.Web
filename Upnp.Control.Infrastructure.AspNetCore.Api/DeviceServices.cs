namespace Upnp.Control.Infrastructure.AspNetCore.Api;

internal static class DeviceServices
{
    /// <summary>
    /// Provides the list of all available UPnP devices that belong to the <paramref name="category" />.
    /// </summary>
    /// <param name="handler">Query handler.</param>
    /// <param name="category">Device category filter.</param>
    /// <param name="withOffline">Whether to include offline devices.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Device information enumerator.</returns>
    public static Ok<IAsyncEnumerable<UpnpDevice>> GetAllAsync(IAsyncEnumerableQueryHandler<GetDevicesQuery, UpnpDevice> handler,
        string category = "upnp", bool withOffline = false, CancellationToken cancellationToken = default) =>
        Ok(handler.ExecuteAsync(new(category, withOffline), cancellationToken));

    /// <summary>
    /// Provides information about UPnP device with <paramref name="id" />.
    /// </summary>
    /// <param name="handler">Query handler.</param>
    /// <param name="id">Device ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><see cref="Task{IResult}" /> containing device information or error response.</returns>
    public static async Task<Results<Ok<UpnpDevice>, NotFound, BadRequest>> GetAsync(
        IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler,
        string id, CancellationToken cancellationToken)
    {
        try
        {
            var value = await handler.ExecuteAsync(new(id), cancellationToken).ConfigureAwait(false);
            return value switch
            {
                not null => Ok(value),
                _ => NotFound()
            };
        }
        catch
        {
            return BadRequest();
        }
    }
}