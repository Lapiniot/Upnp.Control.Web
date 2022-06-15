using IoT.Protocol.Soap;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class ContentDirectoryServices
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
    public static async Task<Results<Ok<CDContent>, NotFound, BadRequest>> BrowseAsync(
        IAsyncQueryHandler<CDGetContentQuery, CDContent> handler,
        string deviceId, string? path, [AsParameters] GetContentOptions options,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId, path, options), cancellationToken).ConfigureAwait(false));
        }
        catch (DeviceNotFoundException)
        {
            return NotFound();
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