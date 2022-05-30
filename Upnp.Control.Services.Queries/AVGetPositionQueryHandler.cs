namespace Upnp.Control.Services.Queries;

internal sealed class AVGetPositionQueryHandler : IAsyncQueryHandler<AVGetPositionQuery, AVPosition>
{
    private readonly IUpnpServiceFactory factory;

    public AVGetPositionQueryHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task<AVPosition> ExecuteAsync(AVGetPositionQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var (deviceId, detailed) = query;
        var avt = await factory.GetServiceAsync<AVTransportService>(deviceId, cancellationToken).ConfigureAwait(false);
        var info = await avt.GetPositionInfoAsync(0, cancellationToken).ConfigureAwait(false);
        return new(info.TryGetValue("Track", out var value) ? value : null,
            info.TryGetValue("TrackDuration", out value) ? value : null,
            info.TryGetValue("RelTime", out value) ? value : null)
        {
            Current = detailed && info.TryGetValue("TrackMetaData", out value) ? DIDLXmlReader.Read(value, true, true).FirstOrDefault() : null
        };
    }
}