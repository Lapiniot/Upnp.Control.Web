using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Web.Upnp.Control.Infrastructure;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services;

public sealed class UpnpEventSubscriptionFactory : IUpnpEventSubscriptionFactory
{
    private readonly ILogger logger;
    private readonly IEventSubscribeClient subscribeClient;
    private readonly IServerAddressesFeature serverAddresses;
    private Uri bindingAddress;

    public UpnpEventSubscriptionFactory(IEventSubscribeClient subscribeClient, IServer server, ILogger<UpnpEventSubscriptionFactory> logger)
    {
        this.subscribeClient = subscribeClient ?? throw new ArgumentNullException(nameof(subscribeClient));
        serverAddresses = (server ?? throw new ArgumentNullException(nameof(server))).Features.Get<IServerAddressesFeature>();
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public IAsyncCancelable Subscribe(Uri subscribeUri, Uri callbackUri, TimeSpan timeout, CancellationToken stoppingToken)
    {
        if(callbackUri is null) throw new ArgumentNullException(nameof(callbackUri));

        if(!callbackUri.IsAbsoluteUri)
        {
            callbackUri = new Uri(bindingAddress ??= HostingExtensions.ResolveExternalBindingAddress(serverAddresses.Addresses, "http"), callbackUri);
        }

        return CancelableOperationScope.StartInScope(token => StartSubscriptionLoopAsync(subscribeUri, callbackUri, timeout, token), stoppingToken);
    }

    private async Task StartSubscriptionLoopAsync(Uri subscribeUri, Uri callbackUri, TimeSpan timeout, CancellationToken cancellationToken)
    {
        try
        {
            var (sid, seconds) = await subscribeClient.SubscribeAsync(subscribeUri, callbackUri, timeout, cancellationToken).ConfigureAwait(false);
            logger.LogInformation($"Successfully subscribed to events from {subscribeUri}. SID: {sid}, Timeout: {seconds} seconds, Callback: {callbackUri}.");
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
        catch(Exception ex)
        {
            logger.LogError(ex, $"Breaking error in the session loop for {subscribeUri}");
            throw;
        }
    }
}