namespace Upnp.Control.Infrastructure.AspNetCore.Middleware;

public partial class ProxyMiddleware
{
    private readonly ILogger<ProxyMiddleware> logger;

    [LoggerMessage(3, LogLevel.Information, "{id}: Request aborted by client", EventName = "Aborted")]
    private partial void LogAborted(string id);

    [LoggerMessage(4, LogLevel.Debug, "{id}: {available} bytes pre-buffered and are ready to be sent to the client", EventName = "Buffered")]
    private partial void LogBuffered(string id, int available);

    [LoggerMessage(2, LogLevel.Information, "{id}: Request successfully completed", EventName = "Completed")]
    private partial void LogCompleted(string id);

    [LoggerMessage(6, LogLevel.Debug, "{id}: Transfer finished, no more content provided by source", EventName = "TransferDone")]
    private partial void LogDone(string id);

    [LoggerMessage(10, LogLevel.Error, "{id}: Error processing proxy request", EventName = "Error")]
    private partial void LogError(string id, Exception exception);

    [LoggerMessage(5, LogLevel.Debug, "{id}: {available} bytes flushed to the client", EventName = "Flushed")]
    private partial void LogFlushed(string id, int available);

    [LoggerMessage(1, LogLevel.Information, "{id}: New proxy request for: HTTP {method} {requestUri}", EventName = "Started")]
    private partial void LogStartRequest(string id, string method, Uri requestUri);

    [LoggerMessage(7, LogLevel.Warning, "{id}: Unsupported HTTP method: {method}", EventName = "UnsupportedMethod")]
    private partial void LogUnsupportedMethod(string id, string method);
}