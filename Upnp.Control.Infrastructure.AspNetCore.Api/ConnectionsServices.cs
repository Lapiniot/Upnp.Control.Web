namespace Upnp.Control.Infrastructure.AspNetCore.Api;

internal static class ConnectionsServices
{
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