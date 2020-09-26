using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp;
using Microsoft.Extensions.Logging;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services
{
    public sealed class UpnpEventSubscribeObserver : IObserver<UpnpDiscoveryEvent>
    {
        private readonly IUpnpSubscriptionsRepository repository;
        private readonly IUpnpEventSubscriptionFactory factory;
        private readonly ILogger<UpnpEventSubscribeObserver> logger;
        private readonly TimeSpan sessionTimeout;

        public UpnpEventSubscribeObserver(ILogger<UpnpEventSubscribeObserver> logger,
            IUpnpSubscriptionsRepository repository, IUpnpEventSubscriptionFactory factory)
        {
            this.repository = repository ?? throw new ArgumentNullException(nameof(repository));
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            sessionTimeout = TimeSpan.FromMinutes(30);
        }

        public async void OnCompleted()
        {
            await TerminateAsync(repository.GetAll()).ConfigureAwait(false);
            repository.Clear();
        }

        public void OnError(Exception error)
        {
        }

        public void OnNext(UpnpDiscoveryEvent e)
        {
            switch(e)
            {
                case UpnpDeviceAppearedEvent dae when dae.Description.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema):
                    SubscribeToEvents(dae.Description);
                    break;
                case UpnpDeviceDisappearedEvent dde:
                    repository.Remove(e.DeviceId, out var subs);
                    var _ = TerminateAsync(subs);
                    break;
            }
        }

        private void SubscribeToEvents(UpnpDeviceDescription description)
        {
            var baseUrl = $"api/events/{Uri.EscapeUriString(description.Udn)}/notify";

            var rcService = description.Services.Single(s => s.ServiceType == UpnpServices.RenderingControl);
            var avtService = description.Services.Single(s => s.ServiceType == UpnpServices.AVTransport);

            repository.Add(description.Udn,
                factory.Subscribe(rcService.EventSubscribeUri, new Uri(baseUrl + "/rc", UriKind.Relative), sessionTimeout),
                factory.Subscribe(avtService.EventSubscribeUri, new Uri(baseUrl + "/avt", UriKind.Relative), sessionTimeout)
            );
        }

        private async Task TerminateAsync(IEnumerable<IAsyncDisposable> subscriptions)
        {
            foreach(var subscription in subscriptions)
            {
                try
                {
                    await subscription.ConfigureAwait(false).DisposeAsync();
                }
                catch(Exception exception)
                {
                    logger.LogError(exception, "Error terminating maintanance worker for UPnP event subscription");
                }
            }
        }
    }
}