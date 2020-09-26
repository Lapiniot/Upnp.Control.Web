using System;
using System.Threading;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IUpnpEventSubscriptionFactory
    {
        IAsyncDisposable Subscribe(Uri subscribeUri, Uri callbackUri, TimeSpan timeout, CancellationToken stoppingToken = default);
    }
}