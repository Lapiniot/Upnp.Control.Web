namespace Upnp.Control.Infrastructure.AspNetCore.Api;

/// <summary>
/// Class containing methods for managing media queue operations.
/// </summary>
public static class QueueServices
{
    /// <summary>
    /// Adds media items to a specified queue on a device.
    /// </summary>
    /// <param name="handler">The command handler to execute the queue addition.</param>
    /// <param name="deviceId">The unique identifier of the device containing the queue.</param>
    /// <param name="queueId">The unique identifier of the queue to add items to.</param>
    /// <param name="source">The media source parameters containing the items to add.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The items were successfully added to the queue.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(MediaSourceParams))]
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> AddAsync(
        IAsyncCommandHandler<QAddItemsCommand> handler,
        string deviceId, string queueId, MediaSourceParams source,
        CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, queueId, source), cancellationToken).ConfigureAwait(false);
            return NoContent();
        }
        catch (DeviceNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().FullName);
        }
    }

    /// <summary>
    /// Removes all items from a specified queue on a device.
    /// </summary>
    /// <param name="handler">The command handler to execute the queue clearance.</param>
    /// <param name="deviceId">The unique identifier of the device containing the queue.</param>
    /// <param name="queueId">The unique identifier of the queue to clear.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The queue was successfully cleared.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> RemoveAllAsync(
        IAsyncCommandHandler<QClearCommand> handler,
        string deviceId, string queueId, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, queueId), cancellationToken).ConfigureAwait(false);
            return NoContent();
        }
        catch (DeviceNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return Problem(title: ex.Message, type: ex.GetType().FullName);
        }
    }
}