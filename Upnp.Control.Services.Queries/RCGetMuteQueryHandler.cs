namespace Upnp.Control.Services.Queries;

internal sealed class RCGetMuteQueryHandler : IAsyncQueryHandler<RCGetMuteQuery, bool?>
{
    private readonly IUpnpServiceFactory factory;

    public RCGetMuteQueryHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task<bool?> ExecuteAsync(RCGetMuteQuery query, CancellationToken cancellationToken)
    {
        var service = await factory.GetServiceAsync<RenderingControlService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
        var result = await service.GetMuteAsync(0, cancellationToken).ConfigureAwait(false);
        return result.TryGetValue("CurrentMute", out var value) && bool.TryParse(value, out var muted) ? muted : null;
    }
}