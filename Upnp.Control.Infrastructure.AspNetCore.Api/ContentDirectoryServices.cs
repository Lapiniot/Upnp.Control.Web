using IoT.Protocol.Soap;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

internal static class ContentDirectoryServices
{
    /// <summary>
    /// Provides directory content at the specified <paramref name="path" /> on the device with <paramref name="deviceId" />.
    /// </summary>
    /// <param name="handler">Query handler.</param>
    /// <param name="deviceId">Device ID.</param>
    /// <param name="path">Directory path.</param>
    /// <param name="options">Browse optiions.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><see cref="Task{IResult}" /> containing directory content or error response.</returns>
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(GetContentOptions))]
    public static async Task<Results<Ok<CDContent>, NotFound, BadRequest>> BrowseAsync(
        IAsyncQueryHandler<CDGetContentQuery, CDContent> handler,
        string deviceId, string? path, [AsParameters] GetContentOptions options,
        CancellationToken cancellationToken)
    {
        try
        {
            path = path is not null ? Uri.UnescapeDataString(path) : null;
            var value = await handler.ExecuteAsync(new(deviceId, path, options), cancellationToken).ConfigureAwait(false);
            return Ok(value);
        }
        catch (SoapException se) when (se.Code == 701)
        {
            return NotFound();
        }
        catch
        {
            return BadRequest();
        }
    }
}