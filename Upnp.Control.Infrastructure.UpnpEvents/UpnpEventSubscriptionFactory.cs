using Upnp.Control.Services;

namespace Upnp.Control.Infrastructure.UpnpEvents;

public sealed partial class UpnpEventSubscriptionFactory : IUpnpEventSubscriptionFactory
{
    private readonly IEventSubscribeClient subscribeClient;
    private readonly IServerAddressesProvider serverAddressesProvider;
    private Uri bindingAddress;

    public UpnpEventSubscriptionFactory(IEventSubscribeClient subscribeClient,
        IServerAddressesProvider serverAddressesProvider,
        ILogger<UpnpEventSubscriptionFactory> logger)
    {
        ArgumentNullException.ThrowIfNull(subscribeClient);
        ArgumentNullException.ThrowIfNull(serverAddressesProvider);
        ArgumentNullException.ThrowIfNull(logger);

        this.subscribeClient = subscribeClient;
        this.serverAddressesProvider = serverAddressesProvider;
        this.logger = logger;
    }

    public IAsyncCancelable Subscribe(Uri subscribeUri, Uri callbackUri, TimeSpan timeout, CancellationToken stoppingToken)
    {
        ArgumentNullException.ThrowIfNull(callbackUri);

        if(!callbackUri.IsAbsoluteUri)
        {
            callbackUri = new Uri(bindingAddress ??= serverAddressesProvider.ResolveExternalBindingAddress("http"), callbackUri);
        }

        return CancelableOperationScope.StartInScope(token => StartSubscriptionLoopAsync(subscribeUri, callbackUri, timeout, token), stoppingToken);
    }

    private async Task StartSubscriptionLoopAsync(Uri subscribeUri, Uri callbackUri, TimeSpan timeout, CancellationToken cancellationToken)
    {
        try
        {
            var (sid, seconds) = await subscribeClient.SubscribeAsync(subscribeUri, callbackUri, timeout, cancellationToken).ConfigureAwait(false);
            LogSubscribed(subscribeUri, sid, seconds, callbackUri);
            LogStarting(sid);
            try
            {
                while(!cancellationToken.IsCancellationRequested)
                {
                    try
                    {
                        await Task.Delay(TimeSpan.FromSeconds(seconds - 5), cancellationToken).ConfigureAwait(false);
                        LogRefreshing(sid);
                        (sid, seconds) = await subscribeClient.RenewAsync(subscribeUri, sid, timeout, cancellationToken).ConfigureAwait(false);
                        LogRefreshed(sid, seconds);
                    }
                    catch(HttpRequestException hre)
                    {
                        LogRefreshFailed(sid, hre.Message);
                        LogRequestingNewSession(subscribeUri);
                        (sid, seconds) = await subscribeClient.SubscribeAsync(subscribeUri, callbackUri, timeout, cancellationToken).ConfigureAwait(false);
                        LogRequestedNewSession(subscribeUri, sid, seconds);
                    }
                    catch(OperationCanceledException) { }
                }
            }
            finally
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                await subscribeClient.UnsubscribeAsync(subscribeUri, sid, cts.Token).ConfigureAwait(false);
                LogCanceled(sid);
            }
        }
        catch(Exception ex)
        {
            LogError(ex, subscribeUri);
            throw;
        }
    }
}