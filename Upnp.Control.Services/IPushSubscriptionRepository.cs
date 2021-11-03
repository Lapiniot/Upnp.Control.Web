using Upnp.Control.Models;

namespace Upnp.Control.Services;

public interface IPushSubscriptionRepository
{
    ValueTask<PushNotificationSubscription> FindAsync(Uri endpoint, NotificationType type, CancellationToken cancellationToken);
    Task RemoveAsync(PushNotificationSubscription subscription, CancellationToken cancellationToken);
    Task AddAsync(PushNotificationSubscription subscription, CancellationToken cancellationToken);
    IAsyncEnumerable<PushNotificationSubscription> EnumerateAsync(NotificationType type, CancellationToken cancellationToken);
}