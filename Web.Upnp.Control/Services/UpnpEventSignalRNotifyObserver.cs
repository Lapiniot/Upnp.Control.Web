using System;
using System.Linq;
using IoT.Protocol.Upnp.DIDL;
using Microsoft.AspNetCore.SignalR;
using Web.Upnp.Control.Hubs;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Models.Events;

namespace Web.Upnp.Control.Services
{
    internal class UpnpEventSignalRNotifyObserver : IObserver<UpnpEvent>
    {
        private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> hub;

        public UpnpEventSignalRNotifyObserver(IHubContext<UpnpEventsHub, IUpnpEventClient> hub)
        {
            this.hub = hub ?? throw new ArgumentNullException(nameof(hub));
        }

        public void OnCompleted()
        {
        }

        public void OnError(Exception error)
        {
        }

        public void OnNext(UpnpEvent value)
        {
            switch(value)
            {
                case UpnpAVTransportPropertyChangedevent avte:
                    NotifyAVTransportEvent(avte);
                    break;
                case UpnpRenderingControlPropertyChangedevent rce:
                    NotifyRenderingControlEvent(rce);
                    break;
            }
        }

        private void NotifyAVTransportEvent(UpnpAVTransportPropertyChangedevent avtEvent)
        {
            var map = avtEvent.Properties;
            var current = map.TryGetValue("CurrentTrackMetaData", out var value) ? DIDLXmlParser.ParseLoose(value).FirstOrDefault() : null;
            var next = map.TryGetValue("NextTrackMetaData", out value) ? DIDLXmlParser.ParseLoose(value).FirstOrDefault() : null;

            var state = new AVState(map.TryGetValue("TransportState", out value) ? value : null, null,
                map.TryGetValue("NumberOfTracks", out value) && int.TryParse(value, out var tracks) ? tracks : (int?)null, null,
                map.TryGetValue("CurrentPlayMode", out value) ? value : null)
            {
                Actions = map.TryGetValue("CurrentTransportActions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null,
                CurrentTrackMetadata = current,
                CurrentTrack = map.TryGetValue("CurrentTrack", out value) ? value : null,
                CurrentTrackUri = map.TryGetValue("CurrentTrackURI", out value) ? value : null,
                NextTrackMetadata = next
            };

            var position = new AVPosition(map.TryGetValue("CurrentTrack", out value) ? value : null,
                map.TryGetValue("CurrentTrackDuration", out value) ? value : null,
                map.TryGetValue("RelativeTimePosition", out value) ? value : null);
                
            var _ = hub.Clients.All.AVTransportEvent(avtEvent.DeviceId, new AVStateMessage(state, position, avtEvent.VendorProperties));
        }

        private void NotifyRenderingControlEvent(UpnpRenderingControlPropertyChangedevent rce)
        {
            var _ = hub.Clients.All.RenderingControlEvent(rce.DeviceId, new RCVolumeState(
                rce.Properties.TryGetValue("Volume", out var v) && uint.TryParse(v, out var vol) ? vol : null,
                rce.Properties.TryGetValue("Mute", out v) ? (v == "1" || v == "true" || v == "True") : null));
        }
    }
}