using System.IO.Compression;

namespace Upnp.Control.Infrastructure.AspNetCore;

public sealed class ZipArchiveResult<TState> : IResult
{
    private readonly string fileName;
    private readonly Func<ZipArchive, TState, CancellationToken, Task> builder;
    private readonly TState state;

    public ZipArchiveResult(string fileName, Func<ZipArchive, TState, CancellationToken, Task> builder, TState state)
    {
        Verify.ThrowIfNullOrEmpty(fileName);
        ArgumentNullException.ThrowIfNull(builder);

        this.fileName = fileName;
        this.builder = builder;
        this.state = state;
    }

    public async Task ExecuteAsync(HttpContext httpContext)
    {
        if (httpContext.Features.Get<IHttpBodyControlFeature>() is { } feature)
        {
            feature.AllowSynchronousIO = true;
        }

        var response = httpContext.Response;
        response.ContentType = "application/zip";
        response.Headers.Add("Content-Disposition", $"attachment; filename=\"{fileName}\"");

        using var archive = new ZipArchive(response.Body, ZipArchiveMode.Create, true);

        await builder(archive, state, httpContext.RequestAborted).ConfigureAwait(false);
    }
}