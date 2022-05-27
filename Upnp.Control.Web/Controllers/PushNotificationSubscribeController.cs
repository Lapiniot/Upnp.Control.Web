using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.Web.Controllers;

public record PushSubscription(NotificationType Type, Uri Endpoint, string P256dhKey, string AuthKey);

[ApiController]
[Route("api/push-subscriptions")]
[Produces("application/json")]
public class PushNotificationSubscribeController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<bool> GetStateAsync([FromServices][NotNull] IAsyncQueryHandler<PSGetQuery, PushNotificationSubscription> handler,
        Uri endpoint, NotificationType type, CancellationToken cancellationToken)
    {
        try
        {
            HttpContext.Response.StatusCode = StatusCodes.Status200OK;
            return await handler.ExecuteAsync(new(type, endpoint), cancellationToken).ConfigureAwait(false) is not null;
        }
        catch
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            throw;
        }
    }

    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task SubscribeAsync([NotNull] PushSubscription subscription,
        [FromServices][NotNull] IAsyncCommandHandler<PSAddCommand> handler,
        [FromServices][NotNull] IBase64UrlDecoder decoder,
        CancellationToken cancellationToken)
    {
        try
        {
            HttpContext.Response.StatusCode = StatusCodes.Status201Created;
            await handler.ExecuteAsync(new(subscription.Type, subscription.Endpoint,
                decoder.Decode(subscription.P256dhKey),
                decoder.Decode(subscription.AuthKey)),
                cancellationToken).ConfigureAwait(false);
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
    public async Task UnsubscribeAsync([FromServices][NotNull] IAsyncCommandHandler<PSRemoveCommand> handler,
        [NotNull] PushSubscription subscription, CancellationToken cancellationToken)
    {
        try
        {
            HttpContext.Response.StatusCode = StatusCodes.Status204NoContent;
            await handler.ExecuteAsync(new(subscription.Type, subscription.Endpoint), cancellationToken).ConfigureAwait(false);
        }
        catch
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            throw;
        }
    }

    [HttpGet("server-key")]
    [Produces("application/octet-stream")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<byte[]> GetServerKeyAsync([FromServices][NotNull] IAsyncQueryHandler<PSGetServerKeyQuery, byte[]> handler, CancellationToken cancellationToken)
    {
        try
        {
            HttpContext.Response.StatusCode = StatusCodes.Status200OK;
            return await handler.ExecuteAsync(PSGetServerKeyQuery.Instance, cancellationToken).ConfigureAwait(false);
        }
        catch
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            throw;
        }
    }
}