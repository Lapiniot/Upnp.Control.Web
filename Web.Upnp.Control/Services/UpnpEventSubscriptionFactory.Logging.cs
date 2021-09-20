namespace Web.Upnp.Control.Services
{
    public partial class UpnpEventSubscriptionFactory
    {
        private readonly ILogger<UpnpEventSubscriptionFactory> logger;

        [LoggerMessage(1, LogLevel.Information, "Successfully subscribed to events from {subscribeUri}. SID: {sid}, Timeout: {seconds} seconds, Callback: {callbackUri}")]
        private partial void LogSubscribed(Uri subscribeUri, string sid, int seconds, Uri callbackUri);

        [LoggerMessage(2, LogLevel.Information, "Starting refresh loop for session: {sid}")]
        private partial void LogStarting(string sid);

        [LoggerMessage(3, LogLevel.Information, "Refreshing subscription for session: {sid}")]
        private partial void LogRefreshing(string sid);

        [LoggerMessage(4, LogLevel.Information, "Successfully refreshed subscription for session: {sid}. Timeout: {seconds} seconds")]
        private partial void LogRefreshed(string sid, int seconds);

        [LoggerMessage(5, LogLevel.Warning, "Failed to refresh subscription for {sid}. {message}")]
        private partial void LogRefreshFailed(string sid, string message);

        [LoggerMessage(6, LogLevel.Information, "Requesting new subscription session at {subscribeUri}")]
        private partial void LogRequestingNewSession(Uri subscribeUri);

        [LoggerMessage(7, LogLevel.Information, "Successfully requested new subscription for {subscribeUri}. SID: {sid}, Timeout: {seconds} seconds")]
        private partial void LogRequestedNewSession(Uri subscribeUri, string sid, int seconds);

        [LoggerMessage(8, LogLevel.Information, "Successfully cancelled subscription for SID: {sid}")]
        private partial void LogCanceled(string sid);

        [LoggerMessage(9, LogLevel.Error, "Breaking error in the session loop for {uri}")]
        private partial void LogError(Exception exception, Uri uri);
    }
}