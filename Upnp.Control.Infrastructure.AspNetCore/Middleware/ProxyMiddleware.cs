using Microsoft.Net.Http.Headers;

using static System.Globalization.CultureInfo;

namespace Upnp.Control.Infrastructure.AspNetCore.Middleware;

public abstract partial class ProxyMiddleware : IMiddleware
{
    private readonly HttpClient client;

    protected ProxyMiddleware(HttpClient client, ILogger<ProxyMiddleware> logger)
    {
        ArgumentNullException.ThrowIfNull(client);
        ArgumentNullException.ThrowIfNull(logger);

        this.client = client;
        this.logger = logger;
        BufferSize = 16 * 1024;
    }

    protected int BufferSize { get; init; }

    #region Implementation of IMiddleware

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var id = context.Connection.Id;

        try
        {
            var requestUri = GetTargetUri(context);
            var method = context.Request.Method;

            LogStartRequest(id, method, requestUri);

            var cancellationToken = context.RequestAborted;

            if (method is not "GET" and not "HEAD")
            {
                LogUnsupportedMethod(id, method);

                context.Response.StatusCode = 405;
                await context.Response.CompleteAsync().ConfigureAwait(false);
                return;
            }

            using var requestMessage = CreateRequestMessage(context, requestUri, method == "GET" ? HttpMethod.Get : HttpMethod.Head);

            using var responseMessage = await client.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead, cancellationToken).ConfigureAwait(false);

            context.Response.StatusCode = (int)responseMessage.StatusCode;

            CopyHeaders(responseMessage, context);

            if (method == "GET")
            {
                await CopyContentAsync(responseMessage, context, cancellationToken).ConfigureAwait(false);
            }

            await context.Response.CompleteAsync().ConfigureAwait(false);

            LogCompleted(id);
        }
        catch (OperationCanceledException)
        {
            LogAborted(id);
        }
        catch (InvalidDataException ide)
        {
            LogError(id, ide);
            context.Response.StatusCode = StatusCodes.Status502BadGateway;
            await context.Response.CompleteAsync().ConfigureAwait(false);
        }
        catch (Exception e)
        {
            LogError(id, e);
            throw;
        }
    }

    #endregion

    protected static Uri GetTargetUri(HttpContext context)
    {
        var url = context.GetRouteValue("url") as string ?? throw new InvalidOperationException();

        return new(url.IndexOf('?', StringComparison.InvariantCulture) switch
        {
            <= 0 => url.Replace("%2F", "/", true, InvariantCulture),
            var i and > 0 => url[..i].Replace("%2F", "/", true, InvariantCulture) + url[i..]
        });
    }

    protected virtual HttpRequestMessage CreateRequestMessage(HttpContext context, Uri requestUri, HttpMethod method)
    {
        var requestMessage = new HttpRequestMessage(method, requestUri);

        foreach (var (name, values) in context.Request.Headers)
        {
            if (name == HeaderNames.Host || name == HeaderNames.Cookie) continue;
            requestMessage.Headers.TryAddWithoutValidation(name, (IEnumerable<string>)values);
        }

        return requestMessage;
    }

    protected virtual void CopyHeaders(HttpResponseMessage responseMessage, HttpContext context)
    {
        var headers = context.Response.Headers;

        foreach (var (key, value) in responseMessage.Headers)
        {
            headers[key] = new([.. value]);
        }

        foreach (var (key, value) in responseMessage.Content.Headers)
        {
            headers[key] = new([.. value]);
        }
    }

    protected virtual async Task CopyContentAsync(HttpResponseMessage responseMessage, HttpContext context, CancellationToken cancellationToken)
    {
        if (!context.Response.HasStarted)
        {
            await context.Response.StartAsync(cancellationToken).ConfigureAwait(false);
        }

        var stream = await responseMessage.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
        await using (stream.ConfigureAwait(false))
            await CopyContentAsync(stream, context, BufferSize, cancellationToken).ConfigureAwait(false);
    }

    protected async Task CopyContentAsync(Stream source, HttpContext context, int bufferSize, CancellationToken cancellationToken)
    {
        var id = context.Connection.Id;
        var writer = context.Response.BodyWriter;

        while (!cancellationToken.IsCancellationRequested)
        {
            var available = 0;
            var buffer = writer.GetMemory(bufferSize);

            while (available < bufferSize)
            {
                var bytes = await source.ReadAsync(buffer[available..], cancellationToken).ConfigureAwait(false);
                if (bytes == 0) break;
                available += bytes;
            }

            writer.Advance(available);

            LogBuffered(id, available);

            await writer.FlushAsync(cancellationToken).ConfigureAwait(false);

            LogFlushed(id, available);

            if (available < bufferSize) break;
        }

        LogDone(id);
    }
}