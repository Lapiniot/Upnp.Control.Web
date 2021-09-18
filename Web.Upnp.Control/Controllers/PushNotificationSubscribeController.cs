using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Controllers;

[ApiController]
[Route("api/push-subscriptions")]
[Produces("application/json")]
public class PushNotificationSubscribeController : ControllerBase
{
    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task SubscribeAsync([FromServices][NotNull] IAsyncCommandHandler<PSAddCommand> handler,
        PushSubscription subscription, CancellationToken cancellationToken)
    {
        try
        {
            HttpContext.Response.StatusCode = StatusCodes.Status201Created;
            await handler.ExecuteAsync(new PSAddCommand(subscription), cancellationToken).ConfigureAwait(false);
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
        PushSubscription subscription, CancellationToken cancellationToken)
    {
        try
        {
            HttpContext.Response.StatusCode = StatusCodes.Status204NoContent;
            await handler.ExecuteAsync(new PSRemoveCommand(subscription), cancellationToken).ConfigureAwait(false);
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