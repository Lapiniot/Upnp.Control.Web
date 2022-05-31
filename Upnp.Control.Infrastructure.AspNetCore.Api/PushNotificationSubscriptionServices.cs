using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public record PushSubscription(NotificationType Type, Uri Endpoint, string P256dhKey, string AuthKey);

public static class PushNotificationSubscriptionServices
{
    public static async Task<bool> GetStateAsync(IAsyncQueryHandler<PSGetQuery, PushNotificationSubscription> handler,
        Uri endpoint, NotificationType type, CancellationToken cancellationToken) =>
        await handler.ExecuteAsync(new(type, endpoint), cancellationToken).ConfigureAwait(false) is not null;

    public static Task SubscribeAsync(PushSubscription subscription, IAsyncCommandHandler<PSAddCommand> handler, IBase64UrlDecoder decoder, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(subscription.Type, subscription.Endpoint,
                decoder.Decode(subscription.P256dhKey),
                decoder.Decode(subscription.AuthKey)),
            cancellationToken);

    public static Task UnsubscribeAsync(IAsyncCommandHandler<PSRemoveCommand> handler, PushSubscription subscription,
        CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(subscription.Type, subscription.Endpoint), cancellationToken);

    public static Task<byte[]> GetServerKeyAsync(IAsyncQueryHandler<PSGetServerKeyQuery, byte[]> handler,
        CancellationToken cancellationToken) =>
        handler.ExecuteAsync(PSGetServerKeyQuery.Instance, cancellationToken);
}