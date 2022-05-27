namespace Upnp.Control.Services.Queries;

internal sealed class RCGetVolumeQueryHandler : IAsyncQueryHandler<RCGetVolumeQuery, RCVolumeState>
{
    private readonly IUpnpServiceFactory factory;

    public RCGetVolumeQueryHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task<RCVolumeState> ExecuteAsync(RCGetVolumeQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var (deviceId, detailed) = query;
        var service = await factory.GetServiceAsync<RenderingControlService>(deviceId, cancellationToken).ConfigureAwait(false);
        var rv = await service.GetVolumeAsync(0, cancellationToken).ConfigureAwait(false);
        var rm = detailed != false ? await service.GetMuteAsync(0, cancellationToken).ConfigureAwait(false) : null;

        return new(
            rv.TryGetValue("CurrentVolume", out var v) && uint.TryParse(v, out var vol) ? vol : null,
            rm != null && rm.TryGetValue("CurrentMute", out v) && bool.TryParse(v, out var muted) ? muted : null);
    }
}