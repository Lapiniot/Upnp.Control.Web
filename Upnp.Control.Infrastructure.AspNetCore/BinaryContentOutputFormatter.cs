using Microsoft.AspNetCore.Mvc.Formatters;

namespace Upnp.Control.Infrastructure.AspNetCore;

internal sealed class BinaryContentOutputFormatter : IOutputFormatter
{
    public bool CanWriteResult(OutputFormatterCanWriteContext context) =>
        context.ContentType == "application/octet-stream" && context.ObjectType == typeof(byte[]);

    public Task WriteAsync(OutputFormatterWriteContext context)
    {
        var bytes = (byte[])context.Object!;
        context.HttpContext.Response.ContentType = "application/octet-stream";
        var vt = context.HttpContext.Response.BodyWriter.WriteAsync(bytes);
        return vt.IsCompletedSuccessfully ? Task.CompletedTask : vt.AsTask();
    }
}