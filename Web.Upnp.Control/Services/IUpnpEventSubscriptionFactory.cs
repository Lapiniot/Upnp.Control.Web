using System;
using System.Threading;

namespace Web.Upnp.Control.Services
{
    public interface IUpnpEventSubscriptionFactory
    {
        IAsyncDisposable Subscribe(Uri subscribeUri, Uri callbackUri, TimeSpan timeout, CancellationToken stoppingToken);
    }
}