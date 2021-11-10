using Upnp.Control.Models;
using Upnp.Control.Models.Events;

namespace Upnp.Control.Infrastructure.SignalR;

public class UpnpEventSignalRNotifyObserver : IObserver<UpnpEvent>
{
    private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> hub;

    public UpnpEventSignalRNotifyObserver(IHubContext<UpnpEventsHub, IUpnpEventClient> hub)
    {
        ArgumentNullException.ThrowIfNull(hub);

        this.hub = hub;
    }

    public void OnCompleted() { }

    public void OnError(Exception error) { }

    public void OnNext(UpnpEvent value)
    {
        switch(value)
        {
            case AVTPropChangedEvent avt:
                NotifyAVTransportEvent(avt);
                break;
            case RCPropChangedEvent rce:
                NotifyRenderingControlEvent(rce);
                break;
        }
    }

    private void NotifyAVTransportEvent(PropChangedUpnpEvent avtEvent)
    {
        if(avtEvent.Properties.Count == 1 &&
            (avtEvent.Properties.ContainsKey("RelativeTimePosition") ||
            avtEvent.Properties.ContainsKey("AbsoluteTimePosition")))
        {
            // Workaround for some quirky renderers that report position changes every second during playback
            // via state variable changes. Some way of throttling is definitely needed here :(
            return;
        }

        var _ = hub.Clients.All.AVTransportEvent(avtEvent.DeviceId,
            new AVStateMessage(
                Factories.CreateAVState(avtEvent.Properties),
                Factories.CreateAVPosition(avtEvent.Properties),
                avtEvent.VendorProperties));
    }

    private void NotifyRenderingControlEvent(PropChangedUpnpEvent rce)
    {
        var _ = hub.Clients.All.RenderingControlEvent(rce.DeviceId,
            new RCStateMessage(new RCVolumeState(
                rce.Properties.TryGetValue("Volume", out var v) && uint.TryParse(v, out var vol) ? vol : null,
                rce.Properties.TryGetValue("Mute", out v) ? v is "1" or "true" or "True" : null)));
    }
}