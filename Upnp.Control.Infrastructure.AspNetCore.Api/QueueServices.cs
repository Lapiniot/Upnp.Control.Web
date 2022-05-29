namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class QueueServices
{
    public static async Task<Results<NoContent, NotFound, BadRequest>> AddAsync(IAsyncCommandHandler<QAddItemsCommand> handler,
        string deviceId, string queueId, MediaSource source,
        CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, queueId, source), cancellationToken).ConfigureAwait(false);
            return TypedResults.NoContent();
        }
        catch (DeviceNotFoundException)
        {
            return TypedResults.NotFound();
        }
        catch (Exception)
        {
            return TypedResults.BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> RemoveAllAsync(IAsyncCommandHandler<QClearCommand> handler,
        string deviceId, string queueId, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, queueId), cancellationToken).ConfigureAwait(false);
            return TypedResults.NoContent();
        }
        catch (DeviceNotFoundException)
        {
            return TypedResults.NotFound();
        }
        catch (Exception)
        {
            return TypedResults.BadRequest();
        }
    }
}