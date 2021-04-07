using System;
using Microsoft.AspNetCore.SignalR;
using Web.Upnp.Control.Hubs;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Models.Events;

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

        public void OnCompleted() {}

        public void OnError(Exception error) {}

        public void OnNext(UpnpDiscoveryEvent e)
        {
            switch(e)
            {
                case UpnpDeviceAppearedEvent dae:
                    _ = context.Clients.All.SsdpDiscoveryEvent(e.DeviceId, new UpnpDiscoveryMessage("appeared", dae.Device));
                    break;
                case UpnpDeviceDisappearedEvent dde:
                    _ = context.Clients.All.SsdpDiscoveryEvent(e.DeviceId, new UpnpDiscoveryMessage("disappeared", dde.Device));
                    break;
            }
        }

        #endregion
    }
}