using Microsoft.AspNetCore.WebUtilities;
using Upnp.Control.Models;
using Upnp.Control.Services;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.Services.Commands;

public sealed class PSAddCommandHandler : IAsyncCommandHandler<PSAddCommand>
{
    private readonly IPushSubscriptionRepository repository;

    public PSAddCommandHandler(IPushSubscriptionRepository repository)
    {
        ArgumentNullException.ThrowIfNull(repository);

        this.repository = repository;
    }

    public async Task ExecuteAsync(PSAddCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var (type, endpoint, p256dhKey, authKey) = command.Subscription;

        var subscription = await repository.FindAsync(endpoint, type, cancellationToken).ConfigureAwait(false);

        if (subscription != null)
        {

            await repository.RemoveAsync(subscription, cancellationToken).ConfigureAwait(false);
            await repository.AddAsync(subscription with
            {
                Created = DateTimeOffset.UtcNow,
                P256dhKey = WebEncoders.Base64UrlDecode(p256dhKey),
                AuthKey = WebEncoders.Base64UrlDecode(authKey)
            }, cancellationToken).ConfigureAwait(false);
        }
        else
        {
            subscription = new PushNotificationSubscription(endpoint, type, DateTimeOffset.UtcNow,
                WebEncoders.Base64UrlDecode(p256dhKey), WebEncoders.Base64UrlDecode(authKey));
            await repository.AddAsync(subscription, cancellationToken).ConfigureAwait(false);
        }
    }
}