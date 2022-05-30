using Upnp.Control.Models.Events;

namespace Upnp.Control.Infrastructure.SignalR;

public class UpnpDiscoverySignalRNotifyObserver : IObserver<UpnpDiscoveryEvent>
{
    private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> context;

    public UpnpDiscoverySignalRNotifyObserver(IHubContext<UpnpEventsHub, IUpnpEventClient> context)
    {
        ArgumentNullException.ThrowIfNull(context);

        this.context = context;
    }

    #region Implementation of IObserver<UpnpDiscoveryEvent>

    public void OnCompleted() { }

    public void OnError(Exception error) { }

    public void OnNext(UpnpDiscoveryEvent value)
    {
        switch (value)
        {
            case UpnpDeviceAppearedEvent { Device: var d, DeviceId: var id }:
                context.Clients.All.SsdpDiscoveryEvent(id, new("appeared", d));
                break;
            case UpnpDeviceDisappearedEvent { Device: var d, DeviceId: var id }:
                context.Clients.All.SsdpDiscoveryEvent(id, new("disappeared", d));
                break;
        }
    }

    #endregion
}