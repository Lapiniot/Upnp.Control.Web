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
    public sealed class AVGetStateQueryHandler : IAsyncQueryHandler<AVGetStateQuery, AVState>
    {
        private readonly IUpnpServiceFactory factory;

        public AVGetStateQueryHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<AVState> ExecuteAsync(AVGetStateQuery query, CancellationToken cancellationToken)
        {
            if(query is null) throw new ArgumentNullException(nameof(query));

            var (deviceId, detailed) = query;
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId, cancellationToken).ConfigureAwait(false);
            var actions = await avt.GetCurrentTransportActionsAsync(0, cancellationToken).ConfigureAwait(false);
            var transport = await avt.GetTransportInfoAsync(0, cancellationToken).ConfigureAwait(false);

            if(detailed != false)
            {
                var media = await avt.GetMediaInfoAsync(0, cancellationToken).ConfigureAwait(false);
                var settings = await avt.GetTransportSettingsAsync(0, cancellationToken).ConfigureAwait(false);
                return new AVState(transport.TryGetValue("CurrentTransportState", out var value) ? value : null,
                    transport.TryGetValue("CurrentTransportStatus", out value) ? value : null,
                    media.TryGetValue("NrTracks", out value) && int.TryParse(value, out var numTracks) ? numTracks : 0,
                    media.TryGetValue("PlayMedium", out value) ? value : null,
                    settings.TryGetValue("PlayMode", out value) ? value : null)
                {
                    Actions = actions.TryGetValue("Actions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null,
                    Current = detailed != false && media.TryGetValue("CurrentURIMetaData", out value) ? DIDLXmlParser.Parse(value, true, true).FirstOrDefault() : null,
                    Next = detailed != false && media.TryGetValue("NextURIMetaData", out value) ? DIDLXmlParser.Parse(value, true, true).FirstOrDefault() : null
                };
            }
            else
            {
                return new AVState(transport.TryGetValue("CurrentTransportState", out var value) ? value : null,
                    transport.TryGetValue("CurrentTransportStatus", out value) ? value : null, null, null, null)
                {
                    Actions = actions.TryGetValue("Actions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null
                };
            }
        }
    }
}