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

    private void NotifyAVTransportEvent(PropChangedUpnpEvent @event) =>
        hub.Clients.All.AVTransportEvent(@event.Device.Udn,
            new(@event.Device, Factories.CreateAVState(@event.Properties),
                Factories.CreateAVPosition(@event.Properties), @event.VendorProperties));

    private void NotifyRenderingControlEvent(PropChangedUpnpEvent @event) =>
        hub.Clients.All.RenderingControlEvent(@event.Device.Udn,
            new(@event.Device,
                new(@event.Properties.TryGetValue("Volume", out var v) && uint.TryParse(v, out var vol) ? vol : null,
                    @event.Properties.TryGetValue("Mute", out v) ? v is "1" or "true" or "True" : null)));

    public void OnCompleted() { }

    public void OnError(Exception error) { }

    public void OnNext(UpnpEvent value)
    {
        switch (value)
        {
            case AVTPropChangedEvent avt:
                NotifyAVTransportEvent(avt);
                break;
            case RCPropChangedEvent rce:
                NotifyRenderingControlEvent(rce);
                break;
        }
    }
}