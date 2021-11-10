using static System.StringSplitOptions;

namespace Upnp.Control.Services.Queries;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class CMGetProtocolInfoQueryHandler : IAsyncQueryHandler<CMGetProtocolInfoQuery, CMProtocolInfo>
{
    private readonly IUpnpServiceFactory factory;

    public CMGetProtocolInfoQueryHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task<CMProtocolInfo> ExecuteAsync(CMGetProtocolInfoQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var service = await factory.GetServiceAsync<ConnectionManagerService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
        var result = await service.GetProtocolInfoAsync(cancellationToken).ConfigureAwait(false);
        return new CMProtocolInfo(
            result.TryGetValue("Source", out var value) ? value.Split(',', TrimEntries | RemoveEmptyEntries) : null,
            result.TryGetValue("Sink", out value) ? value.Split(',', TrimEntries | RemoveEmptyEntries) : null);
    }
}