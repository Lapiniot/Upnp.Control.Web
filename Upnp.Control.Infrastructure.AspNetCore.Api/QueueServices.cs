namespace Upnp.Control.Infrastructure.AspNetCore.Api;

internal static class QueueServices
{
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