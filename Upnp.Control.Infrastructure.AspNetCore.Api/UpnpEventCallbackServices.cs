namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class UpnpEventCallbackServices
{
    public static async Task<Results<NoContent, BadRequest>> NotifyRenderingControlAsync(
        IAsyncCommandHandler<RCPropChangedCommand> handler,
        string deviceId, Stream requestBody, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, requestBody), cancellationToken).ConfigureAwait(false);
            return NoContent();
        }
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, BadRequest>> NotifyAVTransportAsync(
        IAsyncCommandHandler<AVTPropChangedCommand> handler,
        string deviceId, Stream requestBody, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, requestBody), cancellationToken).ConfigureAwait(false);
            return NoContent();
        }
        catch
        {
            return BadRequest();
        }
    }
}