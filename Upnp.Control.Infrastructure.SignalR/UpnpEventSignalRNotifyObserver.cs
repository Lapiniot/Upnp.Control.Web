namespace Upnp.Control.Infrastructure.SignalR;

public sealed class UpnpEventSignalRNotifyObserver : IObserver<AVTPropChangedEvent>, IObserver<RCPropChangedEvent>
{
    private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> hub;

    public UpnpEventSignalRNotifyObserver(IHubContext<UpnpEventsHub, IUpnpEventClient> hub)
    {
        ArgumentNullException.ThrowIfNull(hub);

        this.hub = hub;
    }

    public void OnCompleted() { }

    public void OnError(Exception error) { }

    void IObserver<AVTPropChangedEvent>.OnNext(AVTPropChangedEvent value) =>
        hub.Clients.All.AVTransportEvent(value.Device.Udn,
            new(value.Device, Factories.CreateAVState(value.Properties),
                Factories.CreateAVPosition(value.Properties), value.VendorProperties));

    void IObserver<RCPropChangedEvent>.OnNext(RCPropChangedEvent value) =>
        hub.Clients.All.RenderingControlEvent(value.Device.Udn,
            new(value.Device,
                new(value.Properties.TryGetValue("Volume", out var v) && uint.TryParse(v, out var vol) ? vol : null,
                    value.Properties.TryGetValue("Mute", out v) ? v is "1" or "true" or "True" : null)));
}