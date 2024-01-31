using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Commands;

internal sealed class PSAddCommandHandler(PushSubscriptionDbContext context) :
    IAsyncCommandHandler<PSAddCommand>
{

    public async Task ExecuteAsync(PSAddCommand command, CancellationToken cancellationToken)
    {
        var (type, endpoint, p256dhKey, authKey) = command;

        var updated = await context.Subscriptions
            .Where(s => s.Endpoint == endpoint)
            .ExecuteUpdateAsync(s => s
                .SetProperty(s => s.Type, s => s.Type | type)
                .SetProperty(s => s.P256dhKey, s => p256dhKey ?? s.P256dhKey)
                .SetProperty(s => s.AuthKey, s => authKey ?? s.AuthKey), cancellationToken)
            .ConfigureAwait(false);

        if (updated is 0)
        {
            context.Subscriptions.Add(new(endpoint, type, DateTimeOffset.UtcNow, p256dhKey, authKey));
            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}