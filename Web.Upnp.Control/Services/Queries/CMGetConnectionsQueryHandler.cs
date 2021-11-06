using IoT.Protocol.Upnp.Services;
using Upnp.Control.Services;
using Web.Upnp.Control.Models;

using static System.StringSplitOptions;

namespace Web.Upnp.Control.Services.Queries;

public sealed class CMGetConnectionsQueryHandler : IAsyncQueryHandler<CMGetConnectionsQuery, IEnumerable<string>>
{
    private readonly IUpnpServiceFactory factory;

    public CMGetConnectionsQueryHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task<IEnumerable<string>> ExecuteAsync(CMGetConnectionsQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var service = await factory.GetServiceAsync<ConnectionManagerService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
        var result = await service.GetCurrentConnectionIDsAsync(cancellationToken).ConfigureAwait(false);
        return result["ConnectionIDs"].Split(',', RemoveEmptyEntries | TrimEntries);
    }
}