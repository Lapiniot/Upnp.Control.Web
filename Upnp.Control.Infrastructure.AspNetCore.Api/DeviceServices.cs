using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class DeviceServices
{
    /// <summary>
    /// Provides the list of all available UPnP devices that belong to the <paramref name="category" />.
    /// </summary>
    /// <param name="handler">Query handler.</param>
    /// <param name="category">Device category filter.</param>
    /// <param name="withOffline">Whether to include offline devices.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Device information enumerator.</returns>
    public static IAsyncEnumerable<UpnpDevice> GetAllAsync([NotNull] IAsyncEnumerableQueryHandler<GetDevicesQuery, UpnpDevice> handler,
        string category = "upnp", bool withOffline = false, CancellationToken cancellationToken = default) =>
        handler.ExecuteAsync(new GetDevicesQuery(category, withOffline), cancellationToken);

    /// <summary>
    /// Provides information about UPnP device with <paramref name="id" />.
    /// </summary>
    /// <param name="handler">Query handler.</param>
    /// <param name="id">Device ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><see cref="Task{IResult}" /> containing device information or error response.</returns>
    public static async Task<Results<Ok<UpnpDevice>, NotFound, BadRequest>> GetAsync([NotNull] IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler,
        string id, CancellationToken cancellationToken)
    {
        try
        {
            var value = await handler.ExecuteAsync(new GetDeviceQuery(id), cancellationToken).ConfigureAwait(false);
            return value switch
            {
                not null => TypedResults.Ok(value),
                _ => TypedResults.NotFound()
            };
        }
#pragma warning disable CA1031
        catch
#pragma warning restore CA1031
        {
            return TypedResults.BadRequest();
        }
    }
}