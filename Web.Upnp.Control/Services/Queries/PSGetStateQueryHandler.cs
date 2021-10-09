using System;
using System.Threading;
using System.Threading.Tasks;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries;

public class PSGetStateQueryHandler : IAsyncQueryHandler<PSGetStateQuery, bool>
{
    private readonly PushSubscriptionDbContext context;

    public PSGetStateQueryHandler(PushSubscriptionDbContext context)
    {
        this.context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<bool> ExecuteAsync(PSGetStateQuery query, CancellationToken cancellationToken)
    {
        return await context.FindAsync<PushNotificationSubscription>(new object[] { query.Endpoint, query.Type }).ConfigureAwait(false) is not null;
    }
}