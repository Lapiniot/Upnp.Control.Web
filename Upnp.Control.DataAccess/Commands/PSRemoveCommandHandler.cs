using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Commands;

internal sealed class PSRemoveCommandHandler : IAsyncCommandHandler<PSRemoveCommand>
{
    private readonly PushSubscriptionDbContext context;

    public PSRemoveCommandHandler(PushSubscriptionDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        this.context = context;
    }

    public async Task ExecuteAsync(PSRemoveCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var (_, endpoint) = command;

        var subscription = await context.Subscriptions.FindAsync(new object[] { endpoint }, cancellationToken: cancellationToken).ConfigureAwait(false);

        if (subscription is not null)
        {
            var property = context.Entry(subscription).Property(e => e.Type);
            property.CurrentValue ^= command.Type;
            if (property.CurrentValue == NotificationType.None)
            {
                context.Remove(subscription);
            }

            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}