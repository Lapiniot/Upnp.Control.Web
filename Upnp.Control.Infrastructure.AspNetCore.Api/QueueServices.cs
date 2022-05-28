namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class QueueServices
{
    public static async Task<IResult> AddAsync(IAsyncCommandHandler<QAddItemsCommand> handler,
        string deviceId, string queueId, MediaSource source,
        CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, queueId, source), cancellationToken).ConfigureAwait(false);
            return Results.NoContent();
        }
        catch (HttpRequestException)
        {
            return Results.NotFound();
        }
        catch (Exception)
        {
            return Results.BadRequest();
        }
    }

    public static async Task<IResult> RemoveAllAsync(IAsyncCommandHandler<QClearCommand> handler,
        string deviceId, string queueId, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, queueId), cancellationToken).ConfigureAwait(false);
            return Results.NoContent();
        }
        catch (HttpRequestException)
        {
            return Results.NotFound();
        }
        catch (Exception)
        {
            return Results.BadRequest();
        }
    }
}