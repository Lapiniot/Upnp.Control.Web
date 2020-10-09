using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp;
using Microsoft.Extensions.Logging;
using Web.Upnp.Control.Models.Events;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services
{
    public sealed class UpnpEventSubscribeObserver : IObserver<UpnpDiscoveryEvent>, IAsyncDisposable
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

        #region Implementation of IObserver<UpnpDiscoveryEvent>

        public void OnCompleted()
        {
        }

        public void OnError(Exception error)
        {
        }

        public void OnNext(UpnpDiscoveryEvent e)
        {
            switch(e)
            {
                case UpnpDeviceAppearedEvent dae when dae.Description.Services.Any(s => s.ServiceType == PlaylistService.ServiceSchema):
                    SubscribeToEvents(dae.DeviceId, dae.Description);
                    break;
                case UpnpDeviceDisappearedEvent dde:
                    repository.Remove(dde.DeviceId, out var subscriptions);
                    var _ = TerminateAsync(subscriptions);
                    break;
            }
        }

        #endregion

        #region Implementation of IAsyncDisposable

        public async ValueTask DisposeAsync()
        {
            await TerminateAsync(repository.GetAll()).ConfigureAwait(false);
            repository.Clear();
        }

        #endregion

        private void SubscribeToEvents(string deviceId, UpnpDeviceDescription description)
        {
            var baseUrl = $"api/events/{Uri.EscapeUriString(deviceId)}/notify";

            var rcService = description.Services.Single(s => s.ServiceType == UpnpServices.RenderingControl);
            var avtService = description.Services.Single(s => s.ServiceType == UpnpServices.AVTransport);

            repository.Add(deviceId,
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
                    await subscription.DisposeAsync().ConfigureAwait(false);
                }
                catch(Exception exception)
                {
                    logger.LogError(exception, "Error terminating maintanance worker for UPnP event subscription");
                }
            }
        }
    }
}