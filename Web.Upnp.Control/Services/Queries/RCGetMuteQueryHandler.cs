using IoT.Protocol.Upnp.Services;
using Upnp.Control.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries;

public sealed class RCGetMuteQueryHandler : IAsyncQueryHandler<RCGetMuteQuery, bool?>
{
    private readonly IUpnpServiceFactory factory;

    public RCGetMuteQueryHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task<bool?> ExecuteAsync(RCGetMuteQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var service = await factory.GetServiceAsync<RenderingControlService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
        var result = await service.GetMuteAsync(0, cancellationToken).ConfigureAwait(false);
        return result.TryGetValue("CurrentMute", out var value) && bool.TryParse(value, out var muted) ? muted : null;
    }
}