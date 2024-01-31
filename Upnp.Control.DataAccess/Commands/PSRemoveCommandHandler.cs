using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Commands;

internal sealed class PSRemoveCommandHandler(PushSubscriptionDbContext context) :
    IAsyncCommandHandler<PSRemoveCommand>
{
    public async Task ExecuteAsync(PSRemoveCommand command, CancellationToken cancellationToken)
    {
        var (type, endpoint) = command;

        // Update subscription record if exists, resetting requested command.Type bits
        await context.Subscriptions
            .Where(s => s.Endpoint == endpoint)
            .ExecuteUpdateAsync(s => s.SetProperty(s => s.Type, s => s.Type & ~type), cancellationToken)
            .ConfigureAwait(false);

        // Purge existing subscription record, if Type field reached None value after prev. update operation
        await context.Subscriptions
            .Where(s => s.Endpoint == endpoint && s.Type == NotificationType.None)
            .ExecuteDeleteAsync(cancellationToken)
            .ConfigureAwait(false);
    }
}