using Microsoft.AspNetCore.WebUtilities;
using Upnp.Control.Models.PushNotifications;
using Upnp.Control.Services;
using Upnp.Control.Services.PushNotifications;
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

    public Task ExecuteAsync(PSAddCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var (type, endpoint, p256dhKey, authKey) = command.Subscription;

        return repository.AddOrUpdateAsync(endpoint, type,
            (e, t) => new PushNotificationSubscription(e, t, DateTimeOffset.UtcNow, WebEncoders.Base64UrlDecode(p256dhKey), WebEncoders.Base64UrlDecode(authKey)),
            s => s with { Created = DateTimeOffset.UtcNow, P256dhKey = WebEncoders.Base64UrlDecode(p256dhKey), AuthKey = WebEncoders.Base64UrlDecode(authKey) },
            cancellationToken);
    }
}