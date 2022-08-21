using System.Text.Json;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.Options;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class DeviceServices
{
    /// <summary>
    /// Provides the list of all available UPnP devices that belong to the <paramref name="category" />.
    /// </summary>
    /// <param name="handler">Query handler.</param>
    /// <param name="options">Json serializer options.</param>
    /// <param name="category">Device category filter.</param>
    /// <param name="withOffline">Whether to include offline devices.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Device information enumerator.</returns>
    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode", Justification = "Preserved manually.")]
    [DynamicDependency(DynamicallyAccessedMemberTypes.All, typeof(UpnpDevice))]
    public static PushStreamHttpResult GetAllAsync(IAsyncEnumerableQueryHandler<GetDevicesQuery, UpnpDevice> handler,
        IOptions<JsonOptions> options, string category = "upnp", bool withOffline = false,
        CancellationToken cancellationToken = default) => Stream(
            stream => JsonSerializer.SerializeAsync(stream,
                handler.ExecuteAsync(new(category, withOffline), cancellationToken),
                options.Value.SerializerOptions),
            "application/json");

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