namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public record struct PushSubscriptionRequest(NotificationType Type, Uri Endpoint, string P256dhKey, string AuthKey);

public record struct PushSubscriptionState(NotificationType Type, DateTimeOffset Created);

internal static class PushNotificationSubscriptionServices
{
    public static async Task<Results<Ok<PushSubscriptionState>, NotFound, ProblemHttpResult>> GetStateAsync(
        IAsyncQueryHandler<PSGetQuery, PushNotificationSubscription> handler,
        Uri endpoint, CancellationToken cancellationToken)
    {
        try
        {
            var subscription = await handler.ExecuteAsync(new(endpoint), cancellationToken).ConfigureAwait(false);
            if (subscription is not null)
            {
                return Ok(new PushSubscriptionState(subscription.Type, subscription.Created));
            }
            else
            {
                return NotFound();
            }
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().FullName);
        }
    }

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(PushSubscriptionRequest))]
    public static async Task<Results<NoContent, ProblemHttpResult>> SubscribeAsync(
        IAsyncCommandHandler<PSAddCommand> handler, IBase64UrlDecoder decoder,
        PushSubscriptionRequest subscription, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(subscription.Type, subscription.Endpoint,
                    decoder.FromBase64String(subscription.P256dhKey), decoder.FromBase64String(subscription.AuthKey)),
                cancellationToken).ConfigureAwait(false);
            return NoContent();
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().FullName);
        }
    }

    public static async Task<Results<NoContent, ProblemHttpResult>> UnsubscribeAsync(
        IAsyncCommandHandler<PSRemoveCommand> handler,
        string endpoint, NotificationType type, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(type, new(endpoint)), cancellationToken).ConfigureAwait(false);
            return NoContent();
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().FullName);
        }
    }

    public static async Task<Results<FileContentHttpResult, ProblemHttpResult>> GetServerKeyAsync(
        IAsyncQueryHandler<PSGetServerKeyQuery, byte[]> handler, CancellationToken cancellationToken)
    {
        try
        {
            var contents = await handler.ExecuteAsync(PSGetServerKeyQuery.Instance, cancellationToken).ConfigureAwait(false);
            return Bytes(contents, MediaTypeNames.Application.Octet);
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().FullName);
        }
    }
}