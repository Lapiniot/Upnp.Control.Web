using Upnp.Control.Models;
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
        switch(value)
        {
            case UpnpDeviceAppearedEvent dae:
                _ = context.Clients.All.SsdpDiscoveryEvent(value.DeviceId, new UpnpDiscoveryMessage("appeared", dae.Device));
                break;
            case UpnpDeviceDisappearedEvent dde:
                _ = context.Clients.All.SsdpDiscoveryEvent(value.DeviceId, new UpnpDiscoveryMessage("disappeared", dde.Device));
                break;
        }
    }

    #endregion
}