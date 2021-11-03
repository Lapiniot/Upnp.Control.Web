using Upnp.Control.Services;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.Services.Commands;

public sealed class PSRemoveCommandHandler : IAsyncCommandHandler<PSRemoveCommand>
{
    private readonly IPushSubscriptionRepository repository;

    public PSRemoveCommandHandler(IPushSubscriptionRepository repository)
    {
        ArgumentNullException.ThrowIfNull(repository);

        this.repository = repository;
    }

    public async Task ExecuteAsync(PSRemoveCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var subscription = await repository.FindAsync(command.Subscription.Endpoint, command.Subscription.Type, cancellationToken).ConfigureAwait(false);
        if(subscription is not null)
        {
            await repository.RemoveAsync(subscription, cancellationToken).ConfigureAwait(false);
        }
    }
}