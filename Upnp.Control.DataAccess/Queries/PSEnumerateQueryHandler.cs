using System.Runtime.CompilerServices;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Queries;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class PSEnumerateQueryHandler : IAsyncEnumerableQueryHandler<PSEnumerateQuery, PushNotificationSubscription>
{
    private readonly PushSubscriptionDbContext context;

    public PSEnumerateQueryHandler(PushSubscriptionDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        this.context = context;
    }

    public async IAsyncEnumerable<PushNotificationSubscription> ExecuteAsync(PSEnumerateQuery query, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await foreach (var entity in context.Subscriptions.Where(s => (s.Type & query.Type) == query.Type)
            .AsNoTracking().AsAsyncEnumerable()
            .WithCancellation(cancellationToken).ConfigureAwait(false))
        {
            yield return entity;
        }
    }
}