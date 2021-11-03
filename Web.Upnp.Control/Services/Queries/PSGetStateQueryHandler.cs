using Upnp.Control.Services;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.Services.Queries;

public class PSGetStateQueryHandler : IAsyncQueryHandler<PSGetStateQuery, bool>
{
    private readonly IPushSubscriptionRepository repository;

    public PSGetStateQueryHandler(IPushSubscriptionRepository repository)
    {
        ArgumentNullException.ThrowIfNull(repository);
        this.repository = repository;
    }

    public async Task<bool> ExecuteAsync(PSGetStateQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        return await repository.FindAsync(query.Endpoint, query.Type, cancellationToken).ConfigureAwait(false) is not null;
    }
}