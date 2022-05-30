using Upnp.Control.Models.Events;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class UpnpEventCallbackServices
{
    public static async Task<Results<NoContent, BadRequest>> NotifyRenderingControlAsync(
        IAsyncCommandHandler<NotifyPropChangedCommand<RCPropChangedEvent>> handler,
        string deviceId, HttpRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, request.Body), cancellationToken).ConfigureAwait(false);
            return TypedResults.NoContent();
        }
        catch
        {
            return TypedResults.BadRequest();
        }
    }

    public static async Task<Results<NoContent, BadRequest>> NotifyAVTransportAsync(
        IAsyncCommandHandler<NotifyPropChangedCommand<AVTPropChangedEvent>> handler,
        string deviceId, HttpRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, request.Body), cancellationToken).ConfigureAwait(false);
            return TypedResults.NoContent();
        }
        catch
        {
            return TypedResults.BadRequest();
        }
    }
}