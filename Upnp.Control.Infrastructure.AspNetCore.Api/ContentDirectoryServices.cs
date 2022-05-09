using System.Diagnostics.CodeAnalysis;
using IoT.Protocol.Soap;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class ContentDirectoryServices
{
    public static async Task<IResult> BrowseAsync([NotNull] IAsyncQueryHandler<CDGetContentQuery, CDContent> handler,
        string deviceId, string? path, GetContentOptions options, CancellationToken cancellationToken)
    {
        try
        {
            var value = await handler!.ExecuteAsync(new CDGetContentQuery(deviceId, path, options), cancellationToken).ConfigureAwait(false);
            return Results.Ok(value);
        }
        catch (SoapException se) when (se.Code == 701)
        {
            return Results.NotFound();
        }
#pragma warning disable CA1031
        catch
#pragma warning restore CA1031
        {
            return Results.BadRequest();
        }
    }
}