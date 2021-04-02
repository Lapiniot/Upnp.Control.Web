using System;
using System.Threading;
using System.Threading.Tasks;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PSRemoveCommandHandler : IAsyncCommandHandler<PSRemoveCommand>
    {
        private readonly PushSubscriptionDbContext context;

        public PSRemoveCommandHandler(PushSubscriptionDbContext context)
        {
            this.context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task ExecuteAsync(PSRemoveCommand command, CancellationToken cancellationToken)
        {
            await context.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);
            var subscription = await context.Subscriptions.FindAsync(new object[] { command.Subscription.Endpoint }).ConfigureAwait(false);
            if(subscription != null)
            {
                context.Remove(subscription);
                await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            }
        }
    }
}