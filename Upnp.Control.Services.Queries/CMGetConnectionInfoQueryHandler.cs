namespace Upnp.Control.Services.Queries;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class CMGetConnectionInfoQueryHandler : IAsyncQueryHandler<CMGetConnectionInfoQuery, CMConnectionInfo>
{
    private readonly IUpnpServiceFactory factory;

    public CMGetConnectionInfoQueryHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task<CMConnectionInfo> ExecuteAsync(CMGetConnectionInfoQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var service = await factory.GetServiceAsync<ConnectionManagerService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
        var r = await service.GetCurrentConnectionInfoAsync(query.ConnectionId, cancellationToken).ConfigureAwait(false);
        return new CMConnectionInfo(r["RcsID"], r["AVTransportID"], r["PeerConnectionID"], r["Direction"], r["Status"]);
    }
}