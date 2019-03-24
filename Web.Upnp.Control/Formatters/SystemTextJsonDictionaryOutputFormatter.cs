using System.Collections.Generic;
using System.IO.Pipelines;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Formatters;

namespace Web.Upnp.Control.Formatters
{
    public class SystemTextJsonDictionaryOutputFormatter : IOutputFormatter
    {
        #region Implementation of IOutputFormatter

        public bool CanWriteResult(OutputFormatterCanWriteContext context)
        {
            return context.Object is IDictionary<string, string>;
        }

        public async Task WriteAsync(OutputFormatterWriteContext context)
        {
            var dictionary = (IDictionary<string, string>)context.Object;

            WriteJsonDictionary(context.HttpContext.Response.BodyWriter, dictionary);

            await context.HttpContext.Response.BodyWriter.FlushAsync().ConfigureAwait(false);
        }

        private static void WriteJsonDictionary(PipeWriter pipeWriter, IDictionary<string, string> dictionary)
        {
            var w = new Utf8JsonWriter(pipeWriter);

            w.WriteStartObject();
            foreach(var (key, value) in dictionary)
            {
                w.WriteString(key, value);
            }

            w.WriteEndObject();

            w.Flush();
        }

        #endregion
    }
}