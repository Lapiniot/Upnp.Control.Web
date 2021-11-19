using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;

namespace Web.Upnp.Control.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
[ApiController]
[Route("api/events/{deviceId}")]
[Consumes("application/xml", "text/xml")]
public class UpnpEventsCallbackController : ControllerBase
{
    [HttpNotify("rc")]
    public Task NotifyRenderingControlAsync(string deviceId,
        [FromServices][NotNull] IAsyncCommandHandler<PropChangedUpnpEventCommand<RCPropChangedEvent>> handler,
        CancellationToken cancellationToken)
    {
        return handler.ExecuteAsync(new PropChangedUpnpEventCommand<RCPropChangedEvent>(deviceId, HttpContext.Request.Body), cancellationToken);
    }

    [HttpNotify("avt")]
    public Task NotifyAVTransportAsync(string deviceId,
        [FromServices][NotNull] IAsyncCommandHandler<PropChangedUpnpEventCommand<AVTPropChangedEvent>> handler,
        CancellationToken cancellationToken)
    {
        return handler.ExecuteAsync(new PropChangedUpnpEventCommand<AVTPropChangedEvent>(deviceId, HttpContext.Request.Body), cancellationToken);
    }
}