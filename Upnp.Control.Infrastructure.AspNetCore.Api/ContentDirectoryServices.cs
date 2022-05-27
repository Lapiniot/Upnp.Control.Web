using IoT.Protocol.Soap;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class ContentDirectoryServices
{
    /// <summary>
    /// Provides directory content at the specified <paramref name="path" /> on the device with <paramref name="deviceId" />.
    /// </summary>
    /// <param name="handler">Query handler.</param>
    /// <param name="deviceId">Device ID.</param>
    /// <param name="path">Directory path.</param>
    /// <param name="withParents">Whether to include parent directories information.</param>
    /// <param name="withResourceProps">Whether to include resource info props.</param>
    /// <param name="withVendorProps">Whether to include vendor specific props.</param>
    /// <param name="withMetadata">Whether to include general metadata props about item itself.</param>
    /// <param name="withDevice">Whether to include short general information about device itself.</param>
    /// <param name="take">How many child items to take.</param>
    /// <param name="skip">How many child items to skip.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><see cref="Task{IResult}" /> containing directory content or error response.</returns>
    public static async Task<Results<Ok<CDContent>, NotFound, BadRequest>> BrowseAsync(IAsyncQueryHandler<CDGetContentQuery, CDContent> handler,
        string deviceId, string? path, bool withParents = true, bool withResourceProps = false, bool withVendorProps = false,
        bool withMetadata = false, bool withDevice = true, uint take = 50, uint skip = 0,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var options = new GetContentOptions(withParents, withResourceProps, withVendorProps, withMetadata, withDevice, take, skip);
            var value = await handler.ExecuteAsync(new(deviceId, path, options), cancellationToken).ConfigureAwait(false);
            return TypedResults.Ok(value);
        }
        catch (SoapException se) when (se.Code == 701)
        {
            return TypedResults.NotFound();
        }
#pragma warning disable CA1031
        catch
#pragma warning restore CA1031
        {
            return TypedResults.BadRequest();
        }
    }
}