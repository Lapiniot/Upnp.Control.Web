using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services
{
    public class UpnpEventSubscriptionFactory : IUpnpEventSubscriptionFactory
    {
        private readonly ILogger logger;
        private readonly IEventSubscribeClient subscribeClient;

        public UpnpEventSubscriptionFactory(IEventSubscribeClient subscribeClient, ILogger<UpnpEventSubscriptionFactory> logger)
        {
            this.subscribeClient = subscribeClient;
            this.logger = logger;
        }

        public IAsyncCancelable Subscribe(Uri subscribeUri, Uri callbackUri, TimeSpan timeout, CancellationToken stoppingToken)
        {
            return CancelableScope.StartInScope(token => StartSubscriptionLoopAsync(subscribeUri, callbackUri, timeout, token), stoppingToken);
        }

        private async Task StartSubscriptionLoopAsync(Uri subscribeUri, Uri callbackUri, TimeSpan timeout, CancellationToken cancellationToken)
        {
            var (sid, seconds) = await subscribeClient.SubscribeAsync(subscribeUri, callbackUri, timeout, cancellationToken).ConfigureAwait(false);
            logger.LogInformation($"Successfully subscribed to events from {subscribeUri}. SID: {sid}, Timeout: {seconds} seconds.");
            logger.LogInformation($"Starting refresh loop for session: {sid}.");
            try
            {
                while(!cancellationToken.IsCancellationRequested)
                {
                    try
                    {
                        await Task.Delay(TimeSpan.FromSeconds(seconds - 5), cancellationToken).ConfigureAwait(false);
                        logger.LogInformation($"Refreshing subscription for session: {sid}.");
                        (sid, seconds) = await subscribeClient.RenewAsync(subscribeUri, sid, timeout, cancellationToken).ConfigureAwait(false);
                        logger.LogInformation($"Successfully refreshed subscription for session: {sid}. Timeout: {seconds} seconds.");
                    }
                    catch(HttpRequestException hre)
                    {
                        logger.LogWarning($"Failed to refresh subscription for {sid}. {hre.Message}");
                        logger.LogWarning($"Requesting new subscription session at {subscribeUri}.");
                        (sid, seconds) = await subscribeClient.SubscribeAsync(subscribeUri, callbackUri, timeout, cancellationToken).ConfigureAwait(false);
                        logger.LogInformation($"Successfully requested new subscription for {subscribeUri}. SID: {sid}, Timeout: {seconds} seconds.");
                    }
                    catch(OperationCanceledException) { }
                }
            }
            finally
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                await subscribeClient.UnsubscribeAsync(subscribeUri, sid, cts.Token).ConfigureAwait(false);
                logger.LogInformation($"Successfully cancelled subscription for SID: {sid}.");
            }
        }
    }
}