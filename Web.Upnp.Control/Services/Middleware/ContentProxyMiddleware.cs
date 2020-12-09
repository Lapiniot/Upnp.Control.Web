using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;

namespace Web.Upnp.Control.Services.Middleware
{
    public class ContentProxyMiddleware : ProxyMiddleware
    {
        public ContentProxyMiddleware(HttpClient client) : base(client)
        {
        }

        protected override void CopyHeaders(HttpResponseMessage responseMessage, HttpResponse response)
        {
            base.CopyHeaders(responseMessage, response);
            response.ContentLength = null;
        }

        protected override Task CopyContentAsync(HttpResponseMessage responseMessage, HttpContext context, CancellationToken cancellationToken)
        {
            context.Features.Get<IHttpResponseBodyFeature>()?.DisableBuffering();
            return base.CopyContentAsync(responseMessage, context, cancellationToken);
        }
    }
}