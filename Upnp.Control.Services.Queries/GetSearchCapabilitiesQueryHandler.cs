namespace Upnp.Control.Services.Queries;

internal sealed class GetSearchCapabilitiesQueryHandler(IUpnpServiceFactory factory) : IAsyncQueryHandler<CDSearchCapabilitiesQuery, string[]>
{
    public async Task<string[]> ExecuteAsync(CDSearchCapabilitiesQuery query, CancellationToken cancellationToken)
    {
        var service = await factory.GetServiceAsync<ContentDirectoryService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
        return await service.GetSearchCapabilitiesAsync(cancellationToken).ConfigureAwait(false);
    }
}