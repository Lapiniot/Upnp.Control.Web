using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Web.Upnp.Control.Services.HttpClients;

namespace Web.Upnp.Control.Services
{
    public class ImageLoaderProxyMiddleware : IMiddleware
    {
        private readonly ImageLoaderProxyClient client;

        public ImageLoaderProxyMiddleware(ImageLoaderProxyClient client)
        {
            this.client = client;
        }

        #region Implementation of IMiddleware

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var originalUri = new Uri((string)context.GetRouteValue("url"));
            var response = await client.GetAsync(originalUri, context.Request.Headers, context.RequestAborted).ConfigureAwait(false);
            var content = response.Content;

            context.Response.StatusCode = (int)response.StatusCode;

            foreach(var (key, value) in response.Headers)
            {
                if(!context.Response.Headers.TryGetValue(key, out _))
                {
                    context.Response.Headers.Add(key, value.ToArray());
                }
            }

            foreach(var (key, value) in content.Headers)
            {
                if(!context.Response.Headers.TryGetValue(key, out _))
                {
                    context.Response.Headers.Add(key, value.ToArray());
                }
            }

            await content.CopyToAsync(context.Response.Body).ConfigureAwait(false);
            await context.Response.CompleteAsync().ConfigureAwait(false);
        }

        #endregion
    }
}