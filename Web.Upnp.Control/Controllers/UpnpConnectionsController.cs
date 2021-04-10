using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
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
    [SuppressMessage("Microsoft.Design", "CA1062: Validate arguments of public methods")]
    public class UpnpConnectionsController : ControllerBase
    {
        [HttpGet("protocol-info")]
        [Produces("application/json")]
        public Task<CMProtocolInfo> GetProtocolInfoAsync(
            [FromServices] IAsyncQueryHandler<CMGetProtocolInfoQuery, CMProtocolInfo> handler,
            string id, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new CMGetProtocolInfoQuery(id), cancellationToken);
        }

        [HttpGet("connections")]
        [Produces("application/json")]
        public Task<IEnumerable<string>> GetConnectionsAsync(
            [FromServices] IAsyncQueryHandler<CMGetConnectionsQuery, IEnumerable<string>> handler,
            string id, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new CMGetConnectionsQuery(id), cancellationToken);
        }

        [HttpGet("connections/{connectionId}")]
        [Produces("application/json")]
        public Task<CMConnectionInfo> GetConnectionInfoAsync(
            [FromServices] IAsyncQueryHandler<CMGetConnectionInfoQuery, CMConnectionInfo> handler,
            string id, string connectionId, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new CMGetConnectionInfoQuery(id, connectionId), cancellationToken);
        }
    }
}