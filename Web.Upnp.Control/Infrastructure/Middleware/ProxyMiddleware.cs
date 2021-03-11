using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using static System.Globalization.CultureInfo;

namespace Web.Upnp.Control.Infrastructure.Middleware
{
    public abstract class ProxyMiddleware : IMiddleware
    {
        protected int BufferSize;
        private readonly HttpClient client;
        private readonly ILogger<ProxyMiddleware> logger;

        protected ProxyMiddleware(HttpClient client, ILogger<ProxyMiddleware> logger)
        {
            this.client = client ?? throw new ArgumentNullException(nameof(client));
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
            BufferSize = 16 * 1024;
        }

        #region Implementation of IMiddleware

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var id = context.Connection.Id;

            try
            {
                var requestUri = GetTargetUri(context);
                var method = context.Request.Method;

                logger.LogStartRequest(id, method, requestUri);

                var cancellationToken = context.RequestAborted;

                if(method != "GET" && method != "HEAD")
                {
                    logger.LogUnsupportedMethod(id, method);

                    context.Response.StatusCode = 405;
                    await context.Response.CompleteAsync().ConfigureAwait(false);
                    return;
                }

                using var requestMessage = CreateRequestMessage(context, requestUri, method == "GET" ? HttpMethod.Get : HttpMethod.Head);

                using var responseMessage = await client.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead, cancellationToken).ConfigureAwait(false);

                context.Response.StatusCode = (int)responseMessage.StatusCode;

                CopyHeaders(responseMessage, context);

                if(method == "GET")
                {
                    await CopyContentAsync(responseMessage, context, cancellationToken).ConfigureAwait(false);
                }

                await context.Response.CompleteAsync().ConfigureAwait(false);

                logger.LogCompleted(id);
            }
            catch(OperationCanceledException)
            {
                logger.LogAborted(id);
            }
            catch(Exception exception)
            {
                logger.LogError(id, exception);
                throw;
            }
        }

        #endregion

        protected Uri GetTargetUri(HttpContext context)
        {
            var url = context.GetRouteValue("url") as string ?? throw new InvalidOperationException();

            return new Uri(url.IndexOf('?') switch
            {
                <= 0 => url.Replace("%2F", "/", true, InvariantCulture),
                int i and > 0 => url[..i].Replace("%2F", "/", true, InvariantCulture) + url[i..]
            });
        }

        protected virtual HttpRequestMessage CreateRequestMessage(HttpContext context, Uri requestUri, HttpMethod method)
        {
            var requestMessage = new HttpRequestMessage(method, requestUri);

            foreach(var (k, v) in context.Request.Headers)
            {
                if(k == "Host") continue;
                requestMessage.Headers.TryAddWithoutValidation(k, (IEnumerable<string>)v);
            }

            return requestMessage;
        }

        protected virtual void CopyHeaders(HttpResponseMessage responseMessage, HttpContext context)
        {
            var headers = context.Response.Headers;

            foreach(var (key, value) in responseMessage.Headers)
            {
                headers[key] = new StringValues(value.ToArray());
            }

            foreach(var (key, value) in responseMessage.Content.Headers)
            {
                headers[key] = new StringValues(value.ToArray());
            }
        }

        protected virtual async Task CopyContentAsync(HttpResponseMessage responseMessage, HttpContext context, CancellationToken cancellationToken)
        {
            if(!context.Response.HasStarted)
            {
                await context.Response.StartAsync(cancellationToken).ConfigureAwait(false);
            }

            using(var stream = await responseMessage.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false))
            {
                await CopyContentAsync(stream, context, BufferSize, cancellationToken).ConfigureAwait(false);
            }
        }

        protected async Task CopyContentAsync(Stream source, HttpContext context, int chunkSize, CancellationToken cancellationToken)
        {
            var id = context.Connection.Id;
            var writer = context.Response.BodyWriter;

            while(!cancellationToken.IsCancellationRequested)
            {
                var available = 0;
                var buffer = writer.GetMemory(chunkSize);

                while(available < chunkSize)
                {
                    var bytes = await source.ReadAsync(buffer.Slice(available), cancellationToken).ConfigureAwait(false);
                    if(bytes == 0) break;
                    available += bytes;
                }

                writer.Advance(available);

                logger.LogBuffered(id, available);

                await writer.FlushAsync(cancellationToken).ConfigureAwait(false);

                logger.LogFlushed(id, available);

                if(available < chunkSize) break;
            }

            logger.LogDone(id);
        }
    }
}