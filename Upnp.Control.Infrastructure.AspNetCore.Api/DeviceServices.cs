namespace Upnp.Control.Infrastructure.AspNetCore.Api;

/// <summary>
/// Provides methods for device-related operations.
/// </summary>
public static class DeviceServices
{
    /// <summary>
    /// Retrieves all devices, optionally filtered by category and including offline devices.
    /// </summary>
    /// <param name="handler">The query handler to execute the device retrieval.</param>
    /// <param name="category">The category of devices to retrieve (default: "upnp").</param>
    /// <param name="withOffline">Whether to include offline devices in the results (default: false).</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>An Ok result containing an asynchronous enumerable of UpnpDevice objects.</returns>
    /// <response code="200">Returns requested device list that match criteria.</response>
    public static Ok<IAsyncEnumerable<UpnpDevice>> GetAllAsync(IEnumerableQueryHandler<GetDevicesQuery, UpnpDevice> handler,
        string category = "upnp", bool withOffline = false, CancellationToken cancellationToken = default) =>
        Ok(handler.ExecuteAsync(new(category, withOffline), cancellationToken));

    /// <summary>
    /// Retrieves a specific device by its ID.
    /// </summary>
    /// <param name="handler">The query handler to execute the device retrieval.</param>
    /// <param name="id">The unique identifier of the device to retrieve.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either an Ok result with the device, a NotFound result, or a ProblemHttpResult in case of an error.</returns>
    /// <exception cref="Exception">Thrown if an unexpected error occurs during device retrieval, converted to a ProblemHttpResult.</exception>
    /// <response code="200">Returns requested device information.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<Ok<UpnpDevice>, NotFound, ProblemHttpResult>> GetAsync(
        IQueryHandler<GetDeviceQuery, UpnpDevice> handler,
        string id, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(id), cancellationToken));
        }
        catch (DeviceNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().FullName);
        }
    }
}