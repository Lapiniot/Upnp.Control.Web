using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public record PushSubscription(NotificationType Type, Uri Endpoint, string P256dhKey, string AuthKey);

public static class PushNotificationSubscriptionServices
{
    public static async Task<Results<Ok<bool>, BadRequest>> GetStateAsync(
        IAsyncQueryHandler<PSGetQuery, PushNotificationSubscription> handler,
        string endpoint, NotificationType type, CancellationToken cancellationToken)
    {
        try
        {
            return TypedResults.Ok(await handler.ExecuteAsync(new(type, new(endpoint)), cancellationToken).ConfigureAwait(false) is not null);
        }
        catch
        {
            return TypedResults.BadRequest();
        }
    }

    public static async Task<Results<NoContent, BadRequest>> SubscribeAsync(
        IAsyncCommandHandler<PSAddCommand> handler, IBase64UrlDecoder decoder,
        PushSubscription subscription, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(subscription.Type, subscription.Endpoint,
                decoder.Decode(subscription.P256dhKey), decoder.Decode(subscription.AuthKey)),
                cancellationToken).ConfigureAwait(false);
            return TypedResults.NoContent();
        }
        catch
        {
            return TypedResults.BadRequest();
        }
    }

    public static async Task<Results<NoContent, BadRequest>> UnsubscribeAsync(
        IAsyncCommandHandler<PSRemoveCommand> handler,
        string endpoint, NotificationType type, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(type, new(endpoint)), cancellationToken).ConfigureAwait(false);
            return TypedResults.NoContent();
        }
        catch
        {
            return TypedResults.BadRequest();
        }
    }

    public static async Task<Results<FileContentHttpResult, BadRequest>> GetServerKeyAsync(
        IAsyncQueryHandler<PSGetServerKeyQuery, byte[]> handler, CancellationToken cancellationToken)
    {
        try
        {
            var contents = await handler.ExecuteAsync(PSGetServerKeyQuery.Instance, cancellationToken).ConfigureAwait(false);
            return TypedResults.Bytes(contents, "application/octet-stream");
        }
        catch
        {
            return TypedResults.BadRequest();
        }
    }
}