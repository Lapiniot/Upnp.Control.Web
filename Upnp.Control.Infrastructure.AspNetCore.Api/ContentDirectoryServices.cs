using IoT.Protocol.Soap;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.AspNetCore.Http.StatusCodes;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

/// <summary>
/// Provides content directory services for UPnP devices, handling browsing and searching of media content.
/// </summary>
public static class ContentDirectoryServices
{
    /// <summary>
    /// Browses content based on the provided device ID and path.
    /// </summary>
    /// <param name="handler">The query handler to execute the browse operation.</param>
    /// <param name="deviceId">The identifier of the UPnP device.</param>
    /// <param name="path">The path to browse content from. If null, the root path is used.</param>
    /// <param name="options">Options for getting content, such as media type or other filters.</param>
    /// <param name="cancellationToken">Token to cancel the operation if needed.</param>
    /// <returns>A result that can be Ok with CDContent, NotFound if content is not found, or ProblemHttpResult for other errors.</returns>
    /// <exception cref="SoapException">Thrown when a SOAP error occurs, handled to return NotFound or ProblemHttpResult.</exception>
    /// <exception cref="Exception">General exception handling for unexpected errors.</exception>
    /// <response code="200">Returns requested content.</response>
    /// <response code="404">If requested item was not found.</response>
    /// <response code="400">If SOAP error reported by destination.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(GetContentOptions))]
    public static async Task<Results<Ok<CDContent>, NotFound, ProblemHttpResult>> BrowseAsync(
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
        catch (SoapException se)
        {
            return Problem(
                title: se.Message,
                detail: se.Description,
                type: se.GetType().Name,
                statusCode: Status400BadRequest,
                extensions: new Dictionary<string, object?> { { "code", se.Code } });
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().Name);
        }
    }

    /// <summary>
    /// Searches content based on criteria, device ID, and path.
    /// </summary>
    /// <param name="handler">The query handler to execute the search operation.</param>
    /// <param name="deviceId">The identifier of the UPnP device.</param>
    /// <param name="path">The path to search content from. If null, the root path is used.</param>
    /// <param name="criteria">Search criteria (e.g., media type, title keywords).</param>
    /// <param name="options">Options for getting content, such as media type or other filters.</param>
    /// <param name="cancellationToken">Token to cancel the operation if needed.</param>
    /// <returns>A result that can be Ok with CDContent, NotFound if content is not found, or ProblemHttpResult for errors.</returns>
    /// <exception cref="SoapException">Thrown when a SOAP error occurs, handled to return NotFound or ProblemHttpResult.</exception>
    /// <exception cref="Exception">General exception handling for unexpected errors.</exception>
    /// <response code="200">Returns requested content.</response>
    /// <response code="404">If requested item was not found.</response>
    /// <response code="400">If SOAP error reported by destination.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(GetContentOptions))]
    public static async Task<Results<Ok<CDContent>, NotFound, ProblemHttpResult>> SearchAsync(
        IAsyncQueryHandler<CDSearchContentQuery, CDContent> handler,
        string deviceId, string? path, [FromQuery] string criteria, [AsParameters] GetContentOptions options,
        CancellationToken cancellationToken)
    {
        try
        {
            path = path is not null ? Uri.UnescapeDataString(path) : null;
            var value = await handler.ExecuteAsync(new(deviceId, path, criteria, options), cancellationToken).ConfigureAwait(false);
            return Ok(value);
        }
        catch (SoapException se) when (se.Code == 710)
        {
            return NotFound();
        }
        catch (SoapException se)
        {
            return Problem(
                title: se.Message,
                detail: se.Description,
                type: se.GetType().Name,
                statusCode: Status400BadRequest,
                extensions: new Dictionary<string, object?> { { "code", se.Code } });
        }
        catch (Exception e)
        {
            return Problem(title: e.Message, type: e.GetType().Name);
        }
    }

    /// <summary>
    /// Retrieves the available search capabilities for the specified device.
    /// </summary>
    /// <param name="handler">The query handler to execute the search capabilities query.</param>
    /// <param name="deviceId">The identifier of the UPnP device.</param>
    /// <param name="cancellationToken">Token to cancel the operation if needed.</param>
    /// <returns>A result containing an array of search capabilities strings.</returns>
    /// <exception cref="Exception">General exception handling for unexpected errors.</exception>
    /// <response code="200">Returns requested content.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<Ok<string[]>, ProblemHttpResult>> GetSearchCapabilitiesAsync(
        IAsyncQueryHandler<CDSearchCapabilitiesQuery, string[]> handler, string deviceId,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false));
        }
        catch (Exception e)
        {
            return Problem(title: e.Message, type: e.GetType().Name);
        }
    }
}