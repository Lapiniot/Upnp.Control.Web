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

            foreach(var (key, value) in message.Headers)
            {
                if(!headers.TryGetValue(key, out _)) headers.Add(key, value.ToArray());
            }

            foreach(var (key, value) in message.Content.Headers)
            {
                if(!headers.TryGetValue(key, out _)) headers.Add(key, value.ToArray());
            }

            await using var stream = await message.Content.ReadAsStreamAsync().ConfigureAwait(false);

            await stream.CopyToAsync(response.Body, 16 * 1024).ConfigureAwait(false);
        }
    }
}