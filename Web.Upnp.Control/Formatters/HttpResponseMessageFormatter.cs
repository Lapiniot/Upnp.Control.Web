using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Formatters;

namespace Web.Upnp.Control.Formatters
{
    internal class HttpResponseMessageFormatter : IOutputFormatter
    {
        public bool CanWriteResult(OutputFormatterCanWriteContext context)
        {
            return context.Object is HttpResponseMessage;
        }

        public async Task WriteAsync(OutputFormatterWriteContext context)
        {
            using var message = (HttpResponseMessage)context.Object;
            using var messageContent = message.Content;
            using var httpRequestMessage = message.RequestMessage;

            var response = context.HttpContext.Response;

            response.StatusCode = (int)message.StatusCode;

            var headers = response.Headers;

            foreach(var h in message.Headers)
            {
                if(!headers.TryGetValue(h.Key, out _)) headers.Add(h.Key, h.Value.ToArray());
            }

            foreach(var h in message.Content.Headers)
            {
                if(!headers.TryGetValue(h.Key, out _)) headers.Add(h.Key, h.Value.ToArray());
            }

            using var stream = await message.Content.ReadAsStreamAsync().ConfigureAwait(false);

            await stream.CopyToAsync(response.Body, 16 * 1024).ConfigureAwait(false);
        }
    }
}