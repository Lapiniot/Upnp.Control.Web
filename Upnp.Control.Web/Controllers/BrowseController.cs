using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;

namespace Upnp.Control.Web.Controllers;

[ApiController]
[Route("api/devices/{deviceId}")]
[Produces("application/json")]
public class BrowseController : ControllerBase
{
    [HttpGet("items/{*path}")]
    public Task<CDContent> GetContentAsync([FromServices][NotNull] IAsyncQueryHandler<CDGetContentQuery, CDContent> handler,
        string deviceId, string path, [FromQuery] GetContentOptions options, CancellationToken cancellationToken = default)
    {
        return handler.ExecuteAsync(new CDGetContentQuery(deviceId, path, options), cancellationToken);
    }
}