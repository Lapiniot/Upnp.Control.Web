using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Mvc.Formatters;

namespace Upnp.Control.Infrastructure.AspNetCore;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal class BinaryContentOutputFormatter : IOutputFormatter
{
    public bool CanWriteResult([NotNull] OutputFormatterCanWriteContext context)
    {
        return context.ContentType == "application/octet-stream" && context.ObjectType == typeof(byte[]);
    }

    public Task WriteAsync([NotNull] OutputFormatterWriteContext context)
    {
        var bytes = (byte[])context.Object!;
        context.HttpContext.Response.ContentType = "application/octet-stream";
        var vt = context.HttpContext.Response.BodyWriter.WriteAsync(bytes);
        return vt.IsCompletedSuccessfully ? Task.CompletedTask : vt.AsTask();
    }
}