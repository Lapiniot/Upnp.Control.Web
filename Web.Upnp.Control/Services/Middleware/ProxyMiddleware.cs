using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Primitives;

namespace Web.Upnp.Control.Services.Middleware
{
    public abstract class ProxyMiddleware : IMiddleware
    {
        private readonly HttpClient client;

        protected ProxyMiddleware(HttpClient client)
        {
            this.client = client;
        }

        #region Implementation of IMiddleware

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var cancellationToken = context.RequestAborted;

            using var requestMessage = CreateRequestMessage(context);

            using var responseMessage = await client.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead, cancellationToken).ConfigureAwait(false);

            context.Response.StatusCode = (int)responseMessage.StatusCode;

            CopyHeaders(responseMessage, context.Response);

            await context.Response.StartAsync(cancellationToken).ConfigureAwait(false);

            await CopyContentAsync(responseMessage, context, cancellationToken).ConfigureAwait(false);

            await context.Response.CompleteAsync().ConfigureAwait(false);
        }

        #endregion

        protected virtual async Task CopyContentAsync(HttpResponseMessage responseMessage, HttpContext context, CancellationToken cancellationToken)
        {
            var writer = context.Response.BodyWriter;

            using(var stream = await responseMessage.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false))
            {
                while(!cancellationToken.IsCancellationRequested)
                {
                    var buffer = writer.GetMemory(8 * 1024);
                    var bytes = await stream.ReadAsync(buffer, cancellationToken).ConfigureAwait(false);

                    if(bytes == 0) break;

                    writer.Advance(bytes);
                    await writer.FlushAsync(cancellationToken).ConfigureAwait(false);
                }
            }
        }

        protected virtual void CopyHeaders(HttpResponseMessage responseMessage, HttpResponse response)
        {
            var headers = response.Headers;

            foreach(var (key, value) in responseMessage.Headers)
            {
                headers[key] = new StringValues(value.ToArray());
            }

            foreach(var (key, value) in responseMessage.Content.Headers)
            {
                headers[key] = new StringValues(value.ToArray());
            }
        }

        protected virtual HttpRequestMessage CreateRequestMessage(HttpContext context)
        {
            var originalUri = new Uri(context.GetRouteValue("url") as string ?? throw new InvalidOperationException());

            var requestMessage = new HttpRequestMessage(HttpMethod.Get, originalUri);

            foreach(var (k, v) in context.Request.Headers)
            {
                if(k == "Host") continue;
                requestMessage.Headers.TryAddWithoutValidation(k, (IEnumerable<string>)v);
            }

            return requestMessage;
        }
    }
}