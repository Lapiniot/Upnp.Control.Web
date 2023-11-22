using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Queries;

internal sealed class PSGetQueryHandler : IAsyncQueryHandler<PSGetQuery, PushNotificationSubscription>
{
    private readonly PushSubscriptionDbContext context;

    public PSGetQueryHandler(PushSubscriptionDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);
        this.context = context;
    }

    public async Task<PushNotificationSubscription> ExecuteAsync(PSGetQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        return await context.FindAsync<PushNotificationSubscription>([query.Endpoint], cancellationToken).ConfigureAwait(false);
    }
}