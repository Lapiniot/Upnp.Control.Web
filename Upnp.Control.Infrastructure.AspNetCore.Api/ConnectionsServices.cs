namespace Upnp.Control.Infrastructure.AspNetCore.Api;

internal static class ConnectionsServices
{
    public static async Task<Results<Ok<CMProtocolInfo>, NotFound, BadRequest>> GetProtocolInfoAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<Ok<IEnumerable<string>>, NotFound, BadRequest>> GetConnectionsAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<Ok<CMConnectionInfo>, NotFound, BadRequest>> GetConnectionInfoAsync(
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
        catch
        {
            return BadRequest();
        }
    }
}