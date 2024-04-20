using IoT.Protocol.Soap;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.AspNetCore.Http.StatusCodes;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

internal static class ContentDirectoryServices
{
    /// <summary>
    /// Provides directory content at the specified <paramref name="path" /> from device with <paramref name="deviceId" />.
    /// </summary>
    /// <param name="handler">Query handler.</param>
    /// <param name="deviceId">Device ID.</param>
    /// <param name="path">Directory path.</param>
    /// <param name="options">Browse optiions.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><see cref="Task{IResult}" /> containing directory content or error response.</returns>
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
        catch (SoapException se)
        {
            return Problem(
                title: se.Message,
                detail: se.Description,
                type: se.GetType().Name,
                statusCode: se.Code == 701 ? Status404NotFound : Status400BadRequest,
                extensions: new Dictionary<string, object?> { { "code", se.Code } });
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().Name);
        }
    }

    /// <summary>
    /// Provides directory content at the specified <paramref name="path" /> from device with <paramref name="deviceId" />
    /// that matche <paramref name="criteria"/>.
    /// </summary>
    /// <param name="handler">Query handler.</param>
    /// <param name="deviceId">Device ID.</param>
    /// <param name="path">Directory path.</param>
    /// <param name="criteria">Search query to match.</param>
    /// <param name="options">Browse optiions.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><see cref="Task{IResult}" /> containing directory content or error response.</returns>
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
        catch (SoapException se)
        {
            return Problem(
                title: se.Message,
                detail: se.Description,
                type: se.GetType().Name,
                statusCode: se.Code == 710 ? Status404NotFound : Status400BadRequest,
                extensions: new Dictionary<string, object?> { { "code", se.Code } });
        }
        catch (Exception e)
        {
            return Problem(title: e.Message, type: e.GetType().Name);
        }
    }

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