using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Commands;

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

        var entity = await context.Subscriptions.FindAsync([endpoint], cancellationToken).ConfigureAwait(false);

        if (entity is not null)
        {
            var entry = context.Entry(entity);
            entry.Property(e => e.Type).CurrentValue |= type;
            entry.Property(e => e.P256dhKey).CurrentValue = p256dhKey;
            entry.Property(e => e.AuthKey).CurrentValue = authKey;
        }
        else
        {
            context.Subscriptions.Add(new(endpoint, type, DateTimeOffset.UtcNow, p256dhKey, authKey));
        }

        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}