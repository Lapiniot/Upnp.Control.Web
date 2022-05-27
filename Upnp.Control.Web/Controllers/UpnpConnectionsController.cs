using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;

namespace Upnp.Control.Web.Controllers;

[ApiController]
[Route("api/devices/{id}")]
[Produces("application/json")]
public class UpnpConnectionsController : ControllerBase
{
    [HttpGet("protocol-info")]
    [Produces("application/json")]
    public Task<CMProtocolInfo> GetProtocolInfoAsync([FromServices][NotNull] IAsyncQueryHandler<CMGetProtocolInfoQuery,
        CMProtocolInfo> handler, string id, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(id), cancellationToken);

    [HttpGet("connections")]
    [Produces("application/json")]
    public Task<IEnumerable<string>> GetConnectionsAsync([FromServices][NotNull] IAsyncQueryHandler<CMGetConnectionsQuery, IEnumerable<string>> handler,
        string id, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(id), cancellationToken);

    [HttpGet("connections/{connectionId}")]
    [Produces("application/json")]
    public Task<CMConnectionInfo> GetConnectionInfoAsync([FromServices][NotNull] IAsyncQueryHandler<CMGetConnectionInfoQuery, CMConnectionInfo> handler,
        string id, string connectionId, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(id, connectionId), cancellationToken);
}