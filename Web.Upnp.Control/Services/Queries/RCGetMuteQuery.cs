using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries
{
    public class RCGetMuteQuery : IAsyncQuery<RCGetMuteQueryParams, bool?>
    {
        private readonly IUpnpServiceFactory factory;

        public RCGetMuteQuery(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<bool?> ExecuteAsync(RCGetMuteQueryParams queryParameters, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<RenderingControlService>(queryParameters.DeviceId).ConfigureAwait(false);
            var result = await service.GetMuteAsync(0, cancellationToken).ConfigureAwait(false);
            return result.TryGetValue("CurrentMute", out var value) && bool.TryParse(value, out var muted) ? muted : null;
        }
    }
}