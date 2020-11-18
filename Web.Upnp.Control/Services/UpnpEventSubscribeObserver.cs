using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Models.Events;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services
{
    public sealed class UpnpEventSubscribeObserver : IObserver<UpnpDiscoveryEvent>, IAsyncDisposable
    {
        private readonly IUpnpEventSubscriptionFactory factory;
        private readonly ILogger<UpnpEventSubscribeObserver> logger;
        private readonly IOptionsMonitor<UpnpEventOptions> optionsMonitor;
        private readonly IUpnpSubscriptionsRepository repository;

        public UpnpEventSubscribeObserver(ILogger<UpnpEventSubscribeObserver> logger,
            IUpnpSubscriptionsRepository repository, IUpnpEventSubscriptionFactory factory,
            IOptionsMonitor<UpnpEventOptions> optionsMonitor)
        {
            this.repository = repository ?? throw new ArgumentNullException(nameof(repository));
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
            this.optionsMonitor = optionsMonitor ?? throw new ArgumentNullException(nameof(optionsMonitor));
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region Implementation of IAsyncDisposable

        public async ValueTask DisposeAsync()
        {
            await TerminateAsync(repository.GetAll()).ConfigureAwait(false);
            repository.Clear();
        }

        #endregion

        private void SubscribeToEvents(string deviceId, ICollection<Service> services)
        {
            var baseUrl = $"api/events/{Uri.EscapeUriString(deviceId)}/notify";

            var rcService = services.Single(s => s.ServiceType == UpnpServices.RenderingControl);
            var avtService = services.Single(s => s.ServiceType == UpnpServices.AVTransport);

            var sessionTimeout = optionsMonitor.CurrentValue.SessionTimeout;

            repository.Add(deviceId,
                factory.Subscribe(rcService.EventsUrl, new Uri(baseUrl + "/rc", UriKind.Relative), sessionTimeout),
                factory.Subscribe(avtService.EventsUrl, new Uri(baseUrl + "/avt", UriKind.Relative), sessionTimeout)
            );
        }

        private async Task RenewSubscriptionsAsync(string deviceId, ICollection<Service> services)
        {
            var sessions = repository.Get(deviceId).ToList();

            if(!sessions.Any() || sessions.Any(s => s.IsCompleted))
            {
                await TerminateAsync(sessions).ConfigureAwait(false);
                SubscribeToEvents(deviceId, services);
            }
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
                    logger.LogError(exception, "Error terminating maintenance worker for UPnP event subscription");
                }
            }
        }

        #region Implementation of IObserver<UpnpDiscoveryEvent>

        public void OnCompleted() {}

        public void OnError(Exception error) {}

        public void OnNext(UpnpDiscoveryEvent e)
        {
            switch(e)
            {
                case UpnpDeviceAppearedEvent dae when dae.Device.Services.Any(IsUmiDevice):
                    SubscribeToEvents(dae.DeviceId, dae.Device.Services);
                    break;
                case UpnpDeviceUpdatedEvent due when due.Device.Services.Any(IsUmiDevice):
                    _ = RenewSubscriptionsAsync(due.DeviceId, due.Device.Services);
                    break;
                case UpnpDeviceDisappearedEvent dde:
                    repository.Remove(dde.DeviceId, out var subscriptions);
                    _ = TerminateAsync(subscriptions);
                    break;
            }
        }

        private static bool IsUmiDevice(Service s)
        {
            return s.ServiceType == PlaylistService.ServiceSchema;
        }

        #endregion
    }
}