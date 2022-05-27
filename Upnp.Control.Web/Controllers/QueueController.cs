using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;

namespace Upnp.Control.Web.Controllers;

[ApiController]
[Route("api/devices/{deviceId}/queues/{queueId}/items")]
[Produces("application/json")]
public class QueueController : ControllerBase
{
    [HttpPost]
    [Consumes("application/json")]
    public Task AddAsync([FromServices][NotNull] IAsyncCommandHandler<QAddItemsCommand> handler, string deviceId, string queueId,
        [FromBody] MediaSource source, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, queueId, source), cancellationToken);

    [HttpDelete]
    public Task RemoveAllAsync([FromServices][NotNull] IAsyncCommandHandler<QClearCommand> handler, string deviceId,
        string queueId, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, queueId), cancellationToken);
}