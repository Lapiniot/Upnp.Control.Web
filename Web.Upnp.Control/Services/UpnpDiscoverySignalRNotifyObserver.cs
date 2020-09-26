using System;
using Microsoft.AspNetCore.SignalR;
using Web.Upnp.Control.Hubs;

namespace Web.Upnp.Control.Services
{
    public class UpnpDiscoverySignalRNotifyObserver : IObserver<UpnpDiscoveryEvent>
    {
        private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> context;

        public UpnpDiscoverySignalRNotifyObserver(IHubContext<UpnpEventsHub, IUpnpEventClient> context)
        {
            this.context = context ?? throw new ArgumentNullException(nameof(context));
        }

        #region Implementation of IObserver<UpnpDiscoveryEvent>

        public void OnCompleted()
        {
        }

        public void OnError(Exception error)
        {
        }

        public void OnNext(UpnpDiscoveryEvent e)
        {
            if(e is UpnpDeviceAppearedEvent)
            {
                _ = context.Clients.All.SsdpDiscoveryEvent(e.DeviceId, "appeared");
            }
            else if(e is UpnpDeviceDisappearedEvent)
            {
                _ = context.Clients.All.SsdpDiscoveryEvent(e.DeviceId, "disappeared");
            }
        }

        #endregion
    }
}