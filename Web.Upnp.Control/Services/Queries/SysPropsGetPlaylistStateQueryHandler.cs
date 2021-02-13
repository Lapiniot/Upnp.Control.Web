using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries
{
    public class SysPropsGetPlaylistStateQueryHandler : IAsyncQueryHandler<SysPropsGetPlaylistStateQuery, string>
    {
        private readonly IUpnpServiceFactory factory;

        public SysPropsGetPlaylistStateQueryHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<string> ExecuteAsync(SysPropsGetPlaylistStateQuery query, CancellationToken cancellationToken)
        {
            var sps = await factory.GetServiceAsync<SystemPropertiesService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
            return await sps.GetStringAsync("fastCall?command=state_playlists", cancellationToken).ConfigureAwait(false);
        }
    }
}