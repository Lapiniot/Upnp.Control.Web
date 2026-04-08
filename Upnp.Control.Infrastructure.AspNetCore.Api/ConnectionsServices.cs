namespace Upnp.Control.Infrastructure.AspNetCore.Api;

/// <summary>
/// Provides methods for handling UPnP connection-related operations.
/// </summary>
public static class ConnectionsServices
{
    /// <summary>
    /// Gets protocol information for the specified UPnP device.
    /// </summary>
    /// <param name="handler">The query handler for executing the protocol info query.</param>
    /// <param name="deviceId">The unique identifier of the UPnP device.</param>
    /// <param name="cancellationToken">A token to cancel the asynchronous operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - Ok{CMProtocolInfo} with the protocol information if successful
    /// - NotFound if the device was not found
    /// - ProblemHttpResult with error details if an exception occurred
    /// </returns>
    /// <response code="200">Returns requested protocol information.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<Ok<CMProtocolInfo>, NotFound, ProblemHttpResult>> GetProtocolInfoAsync(
        IAsyncQueryHandler<CMGetProtocolInfoQuery, CMProtocolInfo> handler,
        string deviceId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false));
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

    /// <summary>
    /// Gets connection information for the specified UPnP device.
    /// </summary>
    /// <param name="handler">The query handler for executing the connections query.</param>
    /// <param name="deviceId">The unique identifier of the UPnP device.</param>
    /// <param name="cancellationToken">A token to cancel the asynchronous operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - Ok{Enumerable{string}} with the connection information if successful
    /// - NotFound if the device was not found
    /// - ProblemHttpResult with error details if an exception occurred
    /// </returns>
    /// <response code="200">Returns requested connection ids for device.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<Ok<IEnumerable<string>>, NotFound, ProblemHttpResult>> GetConnectionsAsync(
        IAsyncQueryHandler<CMGetConnectionsQuery, IEnumerable<string>> handler,
        string deviceId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false));
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

    /// <summary>
    /// Gets specific connection information for the specified UPnP device and connection.
    /// </summary>
    /// <param name="handler">The query handler for executing the connection info query.</param>
    /// <param name="deviceId">The unique identifier of the UPnP device.</param>
    /// <param name="connectionId">The unique identifier of the connection.</param>
    /// <param name="cancellationToken">A token to cancel the asynchronous operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - Ok{CMConnectionInfo} with the connection information if successful
    /// - NotFound if the device or connection was not found
    /// - ProblemHttpResult with error details if an exception occurred
    /// </returns>
    /// <response code="200">Returns requested connection information.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<Ok<CMConnectionInfo>, NotFound, ProblemHttpResult>> GetConnectionInfoAsync(
        IAsyncQueryHandler<CMGetConnectionInfoQuery, CMConnectionInfo> handler,
        string deviceId, string connectionId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId, connectionId), cancellationToken).ConfigureAwait(false));
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