using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
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
            throw new NotImplementedException();
        }

        #endregion
    }
}