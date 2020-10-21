using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries
{
    public class AVGetPositionQuery : IAsyncQuery<AVGetPositionQueryParams, AVPosition>
    {
        private readonly IUpnpServiceFactory factory;

        public AVGetPositionQuery(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<AVPosition> ExecuteAsync(AVGetPositionQueryParams queryParameters, CancellationToken cancellationToken)
        {
            var (deviceId, detailed) = queryParameters;
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            var info = await avt.GetPositionInfoAsync(0, cancellationToken).ConfigureAwait(false);
            return new AVPosition(info.TryGetValue("Track", out var value) ? value : null,
                info.TryGetValue("TrackDuration", out value) ? value : null,
                info.TryGetValue("RelTime", out value) ? value : null)
            {
                Current = detailed != false && info.TryGetValue("TrackMetaData", out value) ? DIDLXmlParser.Parse(value).FirstOrDefault() : null
            };
        }
    }
}