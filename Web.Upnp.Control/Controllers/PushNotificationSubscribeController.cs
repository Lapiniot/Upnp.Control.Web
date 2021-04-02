using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/push-subscriptions")]
    [Produces("application/json")]
    public class PushNotificationSubscribeController : ControllerBase
    {
        [HttpPost]
        [Consumes("application/json")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task SubscribeAsync([FromServices] IAsyncCommandHandler<PSAddCommand> handler,
            PushSubscription subscription, CancellationToken cancellationToken)
        {
            try
            {
                await handler.ExecuteAsync(new PSAddCommand(subscription), cancellationToken).ConfigureAwait(false);
                HttpContext.Response.StatusCode = StatusCodes.Status201Created;
            }
            catch
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                throw;
            }
        }

        [HttpDelete]
        [Consumes("application/json")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task UnsubscribeAsync([FromServices] IAsyncCommandHandler<PSRemoveCommand> handler,
            PushSubscription subscription, CancellationToken cancellationToken)
        {
            try
            {
                await handler.ExecuteAsync(new PSRemoveCommand(subscription), cancellationToken).ConfigureAwait(false);
                HttpContext.Response.StatusCode = StatusCodes.Status204NoContent;
            }
            catch
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                throw;
            }
        }
    }
}