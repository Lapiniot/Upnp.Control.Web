using System;
using Microsoft.AspNetCore.SignalR;
using Web.Upnp.Control.Hubs;

namespace Web.Upnp.Control.Services
{
    public class UpnpDiscoverySignalRNotifier : IObserver<UpnpDiscoveryEvent>
    {
        private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> context;

        public UpnpDiscoverySignalRNotifier(IHubContext<UpnpEventsHub, IUpnpEventClient> context)
        {
            this.context = context ?? throw new ArgumentNullException(nameof(context));
        }

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
    }
}