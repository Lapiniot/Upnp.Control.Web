using Microsoft.AspNetCore.Mvc.Formatters;

namespace Upnp.Control.Infrastructure.AspNetCore;

internal sealed class BinaryContentOutputFormatter : IOutputFormatter
{
    public bool CanWriteResult(OutputFormatterCanWriteContext context) =>
        context.ContentType == "application/octet-stream" && context.ObjectType == typeof(byte[]);

    public async Task WriteAsync(OutputFormatterWriteContext context)
    {
        var bytes = (byte[])context.Object!;
        context.HttpContext.Response.ContentType = "application/octet-stream";
        await context.HttpContext.Response.BodyWriter.WriteAsync(bytes).ConfigureAwait(false);
    }
}