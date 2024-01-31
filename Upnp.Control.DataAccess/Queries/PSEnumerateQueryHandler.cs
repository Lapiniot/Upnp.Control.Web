using System.Runtime.CompilerServices;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Queries;

internal sealed class PSEnumerateQueryHandler(PushSubscriptionDbContext context) :
    IAsyncEnumerableQueryHandler<PSEnumerateQuery, PushNotificationSubscription>
{
    public async IAsyncEnumerable<PushNotificationSubscription> ExecuteAsync(PSEnumerateQuery query, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await foreach (var entity in context.Subscriptions.AsNoTracking()
            .Where(s => (s.Type & query.Type) == query.Type)
            .AsAsyncEnumerable()
            .WithCancellation(cancellationToken).ConfigureAwait(false))
        {
            yield return entity;
        }
    }
}