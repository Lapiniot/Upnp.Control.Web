using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;

namespace Upnp.Control.Web.Controllers;

[ApiController]
[Route("api/devices/{deviceId}/queues")]
[Produces("application/json")]
public class QueueController : ControllerBase
{
    [HttpPost("{queueId}/items")]
    [Consumes("application/json")]
    public Task AddAsync([FromServices][NotNull] IAsyncCommandHandler<QAddItemsCommand> handler, string deviceId, string queueId,
        [FromBody] MediaSource source, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new QAddItemsCommand(deviceId, queueId, source), cancellationToken);

    [HttpDelete("{queueId}/items")]
    public Task RemoveAllAsync([FromServices][NotNull] IAsyncCommandHandler<QClearCommand> handler, string deviceId,
        string queueId, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new QClearCommand(deviceId, queueId), cancellationToken);
}