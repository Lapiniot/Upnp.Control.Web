using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.WebUtilities;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PSAddCommandHandler : IAsyncCommandHandler<PSAddCommand>
    {
        private readonly PushSubscriptionDbContext context;

        public PSAddCommandHandler(PushSubscriptionDbContext context)
        {
            this.context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task ExecuteAsync(PSAddCommand command, CancellationToken cancellationToken)
        {
            await context.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);
            var (endpoint, expiration, p256dhKey, authKey) = command.Subscription;

            DateTimeOffset? expires = expiration.HasValue ? DateTimeOffset.FromUnixTimeMilliseconds(expiration.Value) : null;
            var subscription = await context.Subscriptions.FindAsync(new object[] { endpoint }).ConfigureAwait(false);
            if(subscription != null)
            {
                context.Remove(subscription);
                subscription = subscription with
                {
                    Created = DateTimeOffset.UtcNow,
                    Expires = expires,
                    P256dhKey = WebEncoders.Base64UrlDecode(p256dhKey),
                    AuthKey = WebEncoders.Base64UrlDecode(authKey)
                };
                context.Update(subscription);
            }
            else
            {
                subscription = new PushNotificationSubscription(endpoint, DateTimeOffset.UtcNow, expires,
                    WebEncoders.Base64UrlDecode(p256dhKey), WebEncoders.Base64UrlDecode(authKey));
                context.Subscriptions.Add(subscription);
            }

            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}