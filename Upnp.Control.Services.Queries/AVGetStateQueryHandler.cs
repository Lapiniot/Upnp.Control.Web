namespace Upnp.Control.Services.Queries;

internal sealed class AVGetStateQueryHandler : IAsyncQueryHandler<AVGetStateQuery, AVState>
{
    private readonly IUpnpServiceFactory factory;

    public AVGetStateQueryHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task<AVState> ExecuteAsync(AVGetStateQuery query, CancellationToken cancellationToken)
    {
        var (deviceId, detailed) = query;
        var avt = await factory.GetServiceAsync<AVTransportService>(deviceId, cancellationToken).ConfigureAwait(false);
        var actions = await avt.GetCurrentTransportActionsAsync(0, cancellationToken).ConfigureAwait(false);
        var transport = await avt.GetTransportInfoAsync(0, cancellationToken).ConfigureAwait(false);

        if (detailed)
        {
            var media = await avt.GetMediaInfoAsync(0, cancellationToken).ConfigureAwait(false);
            var settings = await avt.GetTransportSettingsAsync(0, cancellationToken).ConfigureAwait(false);
            return new(transport.TryGetValue("CurrentTransportState", out var value) ? value : null,
                transport.TryGetValue("CurrentTransportStatus", out value) ? value : null,
                media.TryGetValue("NrTracks", out value) && int.TryParse(value, out var numTracks) ? numTracks : 0,
                media.TryGetValue("PlayMedium", out value) ? value : null,
                settings.TryGetValue("PlayMode", out value) ? value : null)
            {
                Actions = actions.TryGetValue("Actions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null,
                Current = media.TryGetValue("CurrentURIMetaData", out value) ? DIDLXmlReader.Read(value, true, true).FirstOrDefault() : null,
                Next = media.TryGetValue("NextURIMetaData", out value) ? DIDLXmlReader.Read(value, true, true).FirstOrDefault() : null
            };
        }
        else
        {
            return new(transport.TryGetValue("CurrentTransportState", out var value) ? value : null,
                transport.TryGetValue("CurrentTransportStatus", out value) ? value : null, null, null, null)
            {
                Actions = actions.TryGetValue("Actions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null
            };
        }
    }
}