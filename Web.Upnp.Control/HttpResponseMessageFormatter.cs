using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Primitives;

namespace Web.Upnp.Control
{
    internal class HttpResponseMessageFormatter : IOutputFormatter
    {
        public bool CanWriteResult(OutputFormatterCanWriteContext context)
        {
            return context.Object is HttpResponseMessage;
        }

        public async Task WriteAsync(OutputFormatterWriteContext context)
        {
            using(var response = (HttpResponseMessage)context.Object)
            {
                context.ContentType = response.Content.Headers.ContentType.ToString();

                context.HttpContext.Response.StatusCode = (int)response.StatusCode;

                foreach(var h in response.Headers)
                {
                    context.HttpContext.Response.Headers.Add(h.Key, h.Value.ToArray());
                }

                foreach(var h in response.Content.Headers)
                {
                    context.HttpContext.Response.Headers.Add(h.Key, h.Value.ToArray());
                }

                using(var stream = await response.Content.ReadAsStreamAsync().ConfigureAwait(false))
                {
                    await stream.CopyToAsync(context.HttpContext.Response.Body, 16 * 1024).ConfigureAwait(false);
                }
            }
        }
    }
}