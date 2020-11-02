using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/devices/{id}")]
    [Produces("application/json")]
    public class UpnpConnectionsController : ControllerBase
    {
        [HttpGet("protocol-info")]
        [Produces("application/json")]
        public Task<CMProtocolInfo> GetProtocolInfoAsync([FromServices] IAsyncQuery<CMGetProtocolInfoParams, CMProtocolInfo> query, string id, CancellationToken cancellationToken)
        {
            return query.ExecuteAsync(new CMGetProtocolInfoParams(id), cancellationToken);
        }

        [HttpGet("connections")]
        [Produces("application/json")]
        public Task<IEnumerable<string>> GetConnectionsAsync(
            [FromServices] IAsyncQuery<CMGetConnectionsParams, IEnumerable<string>> query,
            string id, CancellationToken cancellationToken)
        {
            return query.ExecuteAsync(new CMGetConnectionsParams(id), cancellationToken);
        }

        [HttpGet("connections/{connectionId}")]
        [Produces("application/json")]
        public Task<CMConnectionInfo> GetConnectionInfoAsync(
            [FromServices] IAsyncQuery<CMGetConnectionInfoParams, CMConnectionInfo> query,
            string id, string connectionId, CancellationToken cancellationToken)
        {
            return query.ExecuteAsync(new CMGetConnectionInfoParams(id, connectionId), cancellationToken);
        }
    }
}