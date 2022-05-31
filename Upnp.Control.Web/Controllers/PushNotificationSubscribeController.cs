using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;
using Upnp.Control.Infrastructure.AspNetCore.Api;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.Web.Controllers;

[ApiController]
[Route("api/push-subscriptions")]
[Produces("application/json")]
public class PushNotificationSubscribeController : ControllerBase
{
    [HttpGet]
    public Task<bool> GetStateAsync([FromServices][NotNull] IAsyncQueryHandler<PSGetQuery, PushNotificationSubscription> handler,
        Uri endpoint, NotificationType type, CancellationToken cancellationToken) =>
        PushNotificationSubscriptionServices.GetStateAsync(handler, endpoint, type, cancellationToken);

    [HttpPost]
    [Consumes("application/json")]
    public Task SubscribeAsync([NotNull] PushSubscription subscription,
        [FromServices][NotNull] IAsyncCommandHandler<PSAddCommand> handler,
        [FromServices][NotNull] IBase64UrlDecoder decoder,
        CancellationToken cancellationToken) =>
        PushNotificationSubscriptionServices.SubscribeAsync(subscription, handler, decoder, cancellationToken);

    [HttpDelete]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public Task UnsubscribeAsync([FromServices][NotNull] IAsyncCommandHandler<PSRemoveCommand> handler,
        [NotNull] PushSubscription subscription, CancellationToken cancellationToken) =>
        PushNotificationSubscriptionServices.UnsubscribeAsync(handler, subscription, cancellationToken);

    [HttpGet("server-key")]
    [Produces("application/octet-stream")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public Task<byte[]> GetServerKeyAsync([FromServices][NotNull] IAsyncQueryHandler<PSGetServerKeyQuery, byte[]> handler, CancellationToken cancellationToken) =>
        PushNotificationSubscriptionServices.GetServerKeyAsync(handler, cancellationToken);
}