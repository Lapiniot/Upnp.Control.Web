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
        public async Task GetContentAsync([FromServices] IAsyncQuery<GetContentQueryParams, GetContentResult> query,
            string deviceId, string path, [FromQuery] GetContentOptions options,
            [FromQuery] bool? withResourceProps = false, [FromQuery] bool? withVendorProps = false,
            CancellationToken cancellationToken = default)
        {
            var result = await query.ExecuteAsync(new GetContentQueryParams(deviceId, path, options), cancellationToken).ConfigureAwait(false);

            await using var jsonWriter = new Utf8JsonWriter(Response.BodyWriter);

            DIDLJsonSerializer.Serialize(jsonWriter, result.Total, result.Items, result.Parents, withResourceProps != false, withVendorProps != false);

            await Response.BodyWriter.FlushAsync(cancellationToken).ConfigureAwait(false);
            await Response.BodyWriter.CompleteAsync().ConfigureAwait(false);
        }
    }
}