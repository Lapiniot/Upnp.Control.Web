using Upnp.Control.Models.PushNotifications;
using Upnp.Control.Services;

namespace Upnp.Control.DataAccess.Commands;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class PSAddCommandHandler : IAsyncCommandHandler<PSAddCommand>
{
    private readonly PushSubscriptionDbContext context;

    public PSAddCommandHandler(PushSubscriptionDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        this.context = context;
    }

    public async Task ExecuteAsync(PSAddCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var (type, endpoint, p256dhKey, authKey) = command;

        var entity = await context.Subscriptions.FindAsync(new object[] { endpoint }, cancellationToken).ConfigureAwait(false);

        if(entity is not null)
        {
            var entry = context.Entry(entity);
            entry.Property(e => e.Type).CurrentValue |= type;
            entry.Property(e => e.P256dhKey).CurrentValue = p256dhKey;
            entry.Property(e => e.AuthKey).CurrentValue = authKey;
        }
        else
        {
            context.Subscriptions.Add(new PushNotificationSubscription(endpoint, type, DateTimeOffset.UtcNow, p256dhKey, authKey));
        }

        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}