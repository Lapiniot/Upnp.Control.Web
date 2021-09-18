using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands;

public sealed class PSRemoveCommandHandler : IAsyncCommandHandler<PSRemoveCommand>
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

        var subscription = await context.Subscriptions.FindAsync(new object[] { command.Subscription.Endpoint }, cancellationToken).ConfigureAwait(false);
        if(subscription != null)
        {
            context.Remove(subscription);
            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}