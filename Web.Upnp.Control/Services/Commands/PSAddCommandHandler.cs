using Microsoft.AspNetCore.WebUtilities;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands;

public sealed class PSAddCommandHandler : IAsyncCommandHandler<PSAddCommand>
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

        var (type, endpoint, p256dhKey, authKey) = command.Subscription;

        var subscription = await context.Subscriptions.FindAsync(new object[] { endpoint, type }, cancellationToken).ConfigureAwait(false);

        if (subscription != null)
        {
            context.Remove(subscription);
            subscription = subscription with
            {
                Created = DateTimeOffset.UtcNow,
                P256dhKey = WebEncoders.Base64UrlDecode(p256dhKey),
                AuthKey = WebEncoders.Base64UrlDecode(authKey)
            };
            context.Update(subscription);
        }
        else
        {
            subscription = new PushNotificationSubscription(endpoint, type, DateTimeOffset.UtcNow,
                WebEncoders.Base64UrlDecode(p256dhKey), WebEncoders.Base64UrlDecode(authKey));
            context.Subscriptions.Add(subscription);
        }

        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}