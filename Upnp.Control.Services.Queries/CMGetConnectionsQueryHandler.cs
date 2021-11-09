using static System.StringSplitOptions;

namespace Upnp.Control.Services.Queries;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class CMGetConnectionsQueryHandler : IAsyncQueryHandler<CMGetConnectionsQuery, IEnumerable<string>>
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