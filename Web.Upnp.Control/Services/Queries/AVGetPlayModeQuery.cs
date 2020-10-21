using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries
{
    public class AVGetPlayModeQuery : IAsyncQuery<AVGetPlayModeQueryParams, string>
    {
        private readonly IUpnpServiceFactory factory;

        public AVGetPlayModeQuery(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<string> ExecuteAsync(AVGetPlayModeQueryParams queryParameters, CancellationToken cancellationToken)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(queryParameters.DeviceId).ConfigureAwait(false);
            var settings = await avt.GetTransportSettingsAsync(0, cancellationToken).ConfigureAwait(false);
            return settings.TryGetValue("PlayMode", out var value) ? value : null;
        }
    }
}