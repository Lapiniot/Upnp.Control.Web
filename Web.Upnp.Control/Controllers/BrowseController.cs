using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.DIDL;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/devices/{deviceId}")]
    [Produces("application/json")]
    public class BrowseController : ControllerBase
    {
        [HttpGet("items/{*path}")]
        public Task<GetContentResult> GetContentAsync([FromServices] IAsyncQuery<CDGetContentQueryParams, GetContentResult> query,
            string deviceId, string path, [FromQuery] GetContentOptions options, CancellationToken cancellationToken = default)
        {
            return query.ExecuteAsync(new CDGetContentQueryParams(deviceId, path, options), cancellationToken);
        }
    }
}