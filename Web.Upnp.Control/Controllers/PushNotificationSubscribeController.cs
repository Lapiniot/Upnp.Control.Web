using System.Threading;
using System.Threading.Tasks;
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
        public Task SubscribeAsync([FromServices] IAsyncCommandHandler<PSAddCommand> handler,
            PushSubscription subscription, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new PSAddCommand(subscription), cancellationToken);
        }

        [HttpDelete]
        [Consumes("application/json")]
        public Task UnsubscribeAsync([FromServices] IAsyncCommandHandler<PSRemoveCommand> handler,
            PushSubscription subscription, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new PSRemoveCommand(subscription), cancellationToken);
        }
    }
}