namespace Upnp.Control.Infrastructure.AspNetCore.Api;

/// <summary>
/// Class containing methods for handling UPnP event callbacks from devices.
/// </summary>
public static class UpnpEventCallbackServices
{
    /// <summary>
    /// Handles rendering control property change event notifications from UPnP devices.
    /// </summary>
    /// <param name="handler">The command handler to process the rendering control property change event.</param>
    /// <param name="deviceId">The unique identifier of the device sending the event.</param>
    /// <param name="requestBody">The HTTP request body containing the event data.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on successful processing or BadRequest if the event data is invalid.</returns>
    /// <response code="204">The event was successfully processed.</response>
    /// <response code="400">The event data is malformed or invalid.</response>
    public static async Task<Results<NoContent, BadRequest>> NotifyRenderingControlAsync(
        ICommandHandler<RCPropChangedCommand> handler,
        string deviceId, Stream requestBody, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, requestBody), cancellationToken);
            return NoContent();
        }
        catch
        {
            return BadRequest();
        }
    }

    /// <summary>
    /// Handles AV transport property change event notifications from UPnP devices.
    /// </summary>
    /// <param name="handler">The command handler to process the AV transport property change event.</param>
    /// <param name="deviceId">The unique identifier of the device sending the event.</param>
    /// <param name="requestBody">The HTTP request body containing the event data.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on successful processing or BadRequest if the event data is invalid.</returns>
    /// <response code="204">The event was successfully processed.</response>
    /// <response code="400">The event data is malformed or invalid.</response>
    public static async Task<Results<NoContent, BadRequest>> NotifyAVTransportAsync(
        ICommandHandler<AVTPropChangedCommand> handler,
        string deviceId, Stream requestBody, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, requestBody), cancellationToken);
            return NoContent();
        }
        catch
        {
            return BadRequest();
        }
    }
}