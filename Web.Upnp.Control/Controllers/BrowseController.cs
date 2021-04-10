using System.Diagnostics.CodeAnalysis;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/devices/{deviceId}")]
    [Produces("application/json")]
    [SuppressMessage("Microsoft.Design", "CA1062: Validate arguments of public methods")]
    public class BrowseController : ControllerBase
    {
        [HttpGet("items/{*path}")]
        public Task<CDContent> GetContentAsync([FromServices] IAsyncQueryHandler<CDGetContentQuery, CDContent> handler,
            string deviceId, string path, [FromQuery] GetContentOptions options, CancellationToken cancellationToken = default)
        {
            return handler.ExecuteAsync(new CDGetContentQuery(deviceId, path, options), cancellationToken);
        }
    }
}