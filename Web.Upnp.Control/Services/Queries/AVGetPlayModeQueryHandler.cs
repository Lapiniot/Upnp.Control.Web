using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries
{
    public sealed class AVGetPlayModeQueryHandler : IAsyncQueryHandler<AVGetPlayModeQuery, string>
    {
        private readonly IUpnpServiceFactory factory;

        public AVGetPlayModeQueryHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<string> ExecuteAsync(AVGetPlayModeQuery query, CancellationToken cancellationToken)
        {
            if(query is null) throw new ArgumentNullException(nameof(query));
            var avt = await factory.GetServiceAsync<AVTransportService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
            var settings = await avt.GetTransportSettingsAsync(0, cancellationToken).ConfigureAwait(false);
            return settings.TryGetValue("PlayMode", out var value) ? value : null;
        }
    }
}