using System.IO.Compression;
using System.Net.Mime;

namespace Upnp.Control.Infrastructure.AspNetCore;

/// <summary>
/// Represents an <see cref="IResult"/> that when executed will
/// write a zip archive file from the writer callback to the response.
/// </summary>
public sealed class PushZipStreamHttpResult : IResult, IFileHttpResult, IContentTypeHttpResult
{
    private readonly string fileName;
    private readonly Func<ZipArchive, CancellationToken, Task> zipWriterCallback;

    public PushZipStreamHttpResult(string fileName, Func<ZipArchive, CancellationToken, Task> zipWriterCallback)
    {
        ArgumentException.ThrowIfNullOrEmpty(fileName);
        ArgumentNullException.ThrowIfNull(zipWriterCallback);
        this.fileName = fileName;
        this.zipWriterCallback = zipWriterCallback;
    }

    public string? ContentType => MediaTypeNames.Application.Zip;

    public string? FileDownloadName => fileName;

    public async Task ExecuteAsync(HttpContext httpContext)
    {
        if (httpContext.Features.Get<IHttpBodyControlFeature>() is { } feature)
        {
            feature.AllowSynchronousIO = true;
        }

        var response = httpContext.Response;
        response.ContentType = MediaTypeNames.Application.Zip;
        response.Headers.Append("Content-Disposition", $"attachment; filename=\"{fileName}\"");
        using var archive = new ZipArchive(response.Body, ZipArchiveMode.Create, true);
        await zipWriterCallback(archive, httpContext.RequestAborted).ConfigureAwait(false);
    }
}