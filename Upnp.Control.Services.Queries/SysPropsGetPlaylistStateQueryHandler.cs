namespace Upnp.Control.Services.Queries;

internal sealed class SysPropsGetPlaylistStateQueryHandler : IAsyncQueryHandler<SysPropsGetPlaylistStateQuery, string>
{
    private readonly IUpnpServiceFactory factory;

    public SysPropsGetPlaylistStateQueryHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task<string> ExecuteAsync(SysPropsGetPlaylistStateQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var sps = await factory.GetServiceAsync<SystemPropertiesService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
        return await sps.GetStringAsync("fastCall?command=state_playlists", cancellationToken).ConfigureAwait(false);
    }
}