using Upnp.Control.Models.PushNotifications;
using Upnp.Control.Services;

namespace Upnp.Control.DataAccess.Queries;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container

internal class PSGetQueryHandler : IAsyncQueryHandler<PSGetQuery, PushNotificationSubscription>
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


        return await context.Subscriptions.AsNoTracking().FirstOrDefaultAsync(s =>
            s.Endpoint == query.Endpoint && (s.Type & query.Type) == query.Type,
            cancellationToken: cancellationToken).ConfigureAwait(false);
    }
}