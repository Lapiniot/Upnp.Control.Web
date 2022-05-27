namespace Upnp.Control.Services.Queries;

internal sealed class AVGetPlayModeQueryHandler : IAsyncQueryHandler<AVGetPlayModeQuery, string>
{
    private readonly IUpnpServiceFactory factory;

    public AVGetPlayModeQueryHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task<string> ExecuteAsync(AVGetPlayModeQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var avt = await factory.GetServiceAsync<AVTransportService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
        var settings = await avt.GetTransportSettingsAsync(0, cancellationToken).ConfigureAwait(false);
        return settings.TryGetValue("PlayMode", out var value) ? value : null;
    }
}