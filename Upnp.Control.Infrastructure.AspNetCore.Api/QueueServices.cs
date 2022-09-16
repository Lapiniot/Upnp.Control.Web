namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class QueueServices
{
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(MediaSourceParams))]
    public static async Task<Results<NoContent, NotFound, BadRequest>> AddAsync(
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
        catch (Exception)
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> RemoveAllAsync(
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
        catch (Exception)
        {
            return BadRequest();
        }
    }
}