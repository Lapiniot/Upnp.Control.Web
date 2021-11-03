using Upnp.Control.Models;

namespace Upnp.Control.Services;

public interface IPushSubscriptionRepository
{
    ValueTask<PushNotificationSubscription> FindAsync(Uri endpoint, NotificationType type, CancellationToken cancellationToken);
    IAsyncEnumerable<PushNotificationSubscription> EnumerateAsync(NotificationType type, CancellationToken cancellationToken);
    Task RemoveAsync(PushNotificationSubscription subscription, CancellationToken cancellationToken);
    Task AddOrUpdateAsync(Uri endpoint, NotificationType type,
        Func<Uri, NotificationType, PushNotificationSubscription> addFactory,
        Func<PushNotificationSubscription, PushNotificationSubscription> updateFactory,
        CancellationToken cancellationToken);
}