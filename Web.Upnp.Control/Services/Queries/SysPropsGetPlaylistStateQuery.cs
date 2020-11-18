using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries
{
    public class SysPropsGetPlaylistStateQuery : IAsyncQuery<SysPropsGetPlaylistStateQueryParams, string>
    {
        private readonly IUpnpServiceFactory factory;

        public SysPropsGetPlaylistStateQuery(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<string> ExecuteAsync(SysPropsGetPlaylistStateQueryParams queryParameters, CancellationToken cancellationToken)
        {
            var sps = await factory.GetServiceAsync<SystemPropertiesService>(queryParameters.DeviceId).ConfigureAwait(false);
            return await sps.GetStringAsync("fastCall?command=state_playlists", cancellationToken).ConfigureAwait(false);
        }
    }
}