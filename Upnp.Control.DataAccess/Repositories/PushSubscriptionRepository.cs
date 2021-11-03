using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using Upnp.Control.Models;
using Upnp.Control.Services;

namespace Upnp.Control.DataAccess.Repositories;

[SuppressMessage("Performance", "CA1812: Avoid uninstantiated internal classes", Justification = "Instantiated by DI container")]
internal sealed class PushSubscriptionRepository : IPushSubscriptionRepository
{
    private readonly PushSubscriptionDbContext context;

    public PushSubscriptionRepository(PushSubscriptionDbContext context)
    {
        this.context = context;
    }

    public ValueTask<PushNotificationSubscription> FindAsync(Uri endpoint, NotificationType type, CancellationToken cancellationToken)
    {
        return context.Subscriptions.FindAsync(new object[] { endpoint, type }, cancellationToken);
    }

    public async IAsyncEnumerable<PushNotificationSubscription> EnumerateAsync(NotificationType type, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await foreach(var subscription in context.Subscriptions.AsNoTracking().Where(s => s.Type == type).AsAsyncEnumerable().WithCancellation(cancellationToken))
        {
            yield return subscription;
        }
    }

    public Task AddAsync(PushNotificationSubscription subscription, CancellationToken cancellationToken)
    {
        context.Subscriptions.Add(subscription);
        return context.SaveChangesAsync(cancellationToken);
    }

    public Task RemoveAsync(PushNotificationSubscription subscription, CancellationToken cancellationToken)
    {
        context.Subscriptions.Remove(subscription);
        return context.SaveChangesAsync(cancellationToken);
    }

}