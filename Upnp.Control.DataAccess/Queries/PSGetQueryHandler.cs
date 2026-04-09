using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Queries;

internal sealed class PSGetQueryHandler(PushSubscriptionDbContext context) :
    IQueryHandler<PSGetQuery, PushNotificationSubscription>
{
    public async Task<PushNotificationSubscription> ExecuteAsync(PSGetQuery query, CancellationToken cancellationToken) =>
        await context.Subscriptions.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Endpoint == query.Endpoint, cancellationToken)
            .ConfigureAwait(false);
}