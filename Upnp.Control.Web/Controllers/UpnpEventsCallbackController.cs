using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;

namespace Upnp.Control.Web.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
[ApiController]
[Route("api/events/{deviceId}")]
[Consumes("application/xml", "text/xml")]
public class UpnpEventsCallbackController : ControllerBase
{
    [HttpNotify("rc")]
    public Task NotifyRenderingControlAsync(string deviceId,
        [FromServices][NotNull] IAsyncCommandHandler<NotifyPropChangedCommand<RCPropChangedEvent>> handler,
        CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, HttpContext.Request.Body), cancellationToken);

    [HttpNotify("avt")]
    public Task NotifyAVTransportAsync(string deviceId,
        [FromServices][NotNull] IAsyncCommandHandler<NotifyPropChangedCommand<AVTPropChangedEvent>> handler,
        CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, HttpContext.Request.Body), cancellationToken);
}