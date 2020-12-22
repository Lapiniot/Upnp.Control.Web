using System;
using Microsoft.Extensions.Logging;

namespace Web.Upnp.Control.Infrastructure.Middleware
{
    internal static class ProxyMiddlewareLoggingExtensions
    {
        private static Action<ILogger, string, Exception> logError;
        private static Action<ILogger, string, string, string, Exception> logStart;
        private static Action<ILogger, string, Exception> logCompleted;
        private static Action<ILogger, string, Exception> logAborted;
        private static Action<ILogger, string, int, Exception> logBuffered;
        private static Action<ILogger, string, int, Exception> logFlushed;
        private static Action<ILogger, string, Exception> logDone;
        private static Action<ILogger, string, string, Exception> logUnsupportedMethodAction;

        static ProxyMiddlewareLoggingExtensions()
        {
            logError = LoggerMessage.Define<string>(LogLevel.Error, new EventId(10, "Error"), "{Id}: Error processing proxy request");
            logStart = LoggerMessage.Define<string, string, string>(LogLevel.Information, new EventId(1, "Started"), "{Id}: New proxy request for: HTTP {Method} {RequestUri}");
            logCompleted = LoggerMessage.Define<string>(LogLevel.Information, new EventId(2, "Completed"), "{Id}: Request succesfully completed");
            logAborted = LoggerMessage.Define<string>(LogLevel.Information, new EventId(3, "Aborted"), "{Id}: Request aborted by client");
            logBuffered = LoggerMessage.Define<string, int>(LogLevel.Debug, new EventId(4, "Buffered"), "{Id}: {Available} bytes prebuffered and are ready to be sent to the client");
            logFlushed = LoggerMessage.Define<string, int>(LogLevel.Debug, new EventId(5, "Flushed"), "{Id}: {Available} bytes flushed to the client");
            logDone = LoggerMessage.Define<string>(LogLevel.Debug, new EventId(6, "TransferDone"), "{Id}: Transfer finished, no more content provided by source");
            logUnsupportedMethodAction = LoggerMessage.Define<string, string>(LogLevel.Warning, new EventId(7, "UnsupportedMethod"), "{Id}: Unsupported HTTP method: {Method}");
        }

        internal static void LogAborted(this ILogger<ProxyMiddleware> logger, string id)
        {
            logAborted(logger, id, null);
        }

        internal static void LogBuffered(this ILogger<ProxyMiddleware> logger, string id, int available)
        {
            logBuffered(logger, id, available, null);
        }

        internal static void LogCompleted(this ILogger<ProxyMiddleware> logger, string id)
        {
            logCompleted(logger, id, null);
        }

        internal static void LogDone(this ILogger<ProxyMiddleware> logger, string id)
        {
            logDone(logger, id, null);
        }

        internal static void LogError(this ILogger<ProxyMiddleware> logger, string id, Exception exception)
        {
            logError(logger, id, exception);
        }

        internal static void LogFlushed(this ILogger<ProxyMiddleware> logger, string id, int available)
        {
            logFlushed(logger, id, available, null);
        }

        internal static void LogStartRequest(this ILogger<ProxyMiddleware> logger, string id, string method, Uri requestUri)
        {
            logStart(logger, id, method, requestUri.AbsoluteUri, null);
        }

        internal static void LogUnsupportedMethod(this ILogger<ProxyMiddleware> logger, string id, string method)
        {
            logUnsupportedMethodAction(logger, id, method, null);
        }
    }
}