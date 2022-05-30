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
        Models.UpnpDiscoveryMessage message = value switch
        {
            UpnpDeviceAppearedEvent { Device: var d } => new("appeared", d),
            UpnpDeviceDisappearedEvent { Device: var d } => new("disappeared", d),
            _ => throw new NotImplementedException()
        };

        context.Clients.All.SsdpDiscoveryEvent(value.DeviceId, message);
    }

    #endregion
}