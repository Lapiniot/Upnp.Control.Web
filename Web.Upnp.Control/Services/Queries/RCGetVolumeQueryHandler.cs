using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries
{
    public sealed class RCGetVolumeQueryHandler : IAsyncQueryHandler<RCGetVolumeQuery, RCVolumeState>
    {
        private readonly IUpnpServiceFactory factory;

        public RCGetVolumeQueryHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<RCVolumeState> ExecuteAsync(RCGetVolumeQuery query, CancellationToken cancellationToken)
        {
            if(query is null) throw new ArgumentNullException(nameof(query));

            var (deviceId, detailed) = query;
            var service = await factory.GetServiceAsync<RenderingControlService>(deviceId, cancellationToken).ConfigureAwait(false);
            var rv = await service.GetVolumeAsync(0, cancellationToken).ConfigureAwait(false);
            var rm = detailed != false ? await service.GetMuteAsync(0, cancellationToken).ConfigureAwait(false) : null;

            return new RCVolumeState(
                rv.TryGetValue("CurrentVolume", out var v) && uint.TryParse(v, out var vol) ? vol : null,
                rm != null && rm.TryGetValue("CurrentMute", out v) && bool.TryParse(v, out var muted) ? muted : null);
        }
    }
}