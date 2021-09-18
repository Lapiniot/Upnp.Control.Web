using IoT.Protocol.Upnp.DIDL;
using Microsoft.AspNetCore.SignalR;
using Web.Upnp.Control.Hubs;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Models.Events;

namespace Web.Upnp.Control.Services;

public class UpnpEventSignalRNotifyObserver : IObserver<UpnpEvent>
{
    private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> hub;

    public UpnpEventSignalRNotifyObserver(IHubContext<UpnpEventsHub, IUpnpEventClient> hub)
    {
        this.hub = hub ?? throw new ArgumentNullException(nameof(hub));
    }

    public void OnCompleted() { }

    public void OnError(Exception error) { }

    public void OnNext(UpnpEvent value)
    {
        switch(value)
        {
            case UpnpAVTransportPropertyChangedEvent avt:
                NotifyAVTransportEvent(avt);
                break;
            case UpnpRenderingControlPropertyChangedEvent rce:
                NotifyRenderingControlEvent(rce);
                break;
        }
    }

    private void NotifyAVTransportEvent(UpnpPropertyChangedEvent avtEvent)
    {
        if(avtEvent.Properties.Count == 1 &&
            (avtEvent.Properties.ContainsKey("RelativeTimePosition") ||
            avtEvent.Properties.ContainsKey("AbsoluteTimePosition")))
        {
            // Workaround for some quirky renderers that report position changes every second during playback
            // via state variable changes. Some way of throttling is definitely needed here :(
            return;
        }

        var map = avtEvent.Properties;
        var current = map.TryGetValue("CurrentTrackMetaData", out var value) ? DIDLXmlParser.Parse(value, true, true).FirstOrDefault() : null;
        var next = map.TryGetValue("NextTrackMetaData", out value) ? DIDLXmlParser.Parse(value, true, true).FirstOrDefault() : null;

        var state = new AVState(map.TryGetValue("TransportState", out value) ? value : null, null,
            map.TryGetValue("NumberOfTracks", out value) && int.TryParse(value, out var tracks) ? tracks : null, null,
            map.TryGetValue("CurrentPlayMode", out value) ? value : null)
        {
            Actions = map.TryGetValue("CurrentTransportActions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null,
            Current = current,
            Next = next,
            CurrentTrack = map.TryGetValue("CurrentTrack", out value) ? value : null,
            CurrentTrackUri = map.TryGetValue("CurrentTrackURI", out value) && !string.IsNullOrEmpty(value) ? new Uri(value) : null,
        };

        var position = new AVPosition(map.TryGetValue("CurrentTrack", out value) ? value : null,
            map.TryGetValue("CurrentTrackDuration", out value) ? value : null,
            map.TryGetValue("RelativeTimePosition", out value) ? value : null);

        var _ = hub.Clients.All.AVTransportEvent(avtEvent.DeviceId, new AVStateMessage(state, position, avtEvent.VendorProperties));
    }

    private void NotifyRenderingControlEvent(UpnpPropertyChangedEvent rce)
    {
        var _ = hub.Clients.All.RenderingControlEvent(rce.DeviceId,
            new RCStateMessage(new RCVolumeState(
                rce.Properties.TryGetValue("Volume", out var v) && uint.TryParse(v, out var vol) ? vol : null,
                rce.Properties.TryGetValue("Mute", out v) ? v is "1" or "true" or "True" : null)));
    }
}