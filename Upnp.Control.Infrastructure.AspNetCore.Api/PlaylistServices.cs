using Microsoft.AspNetCore.Mvc;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

internal static class PlaylistServices
{
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> CreateAsync(
        IAsyncCommandHandler<PLCreateCommand> handler,
        string deviceId, [FromBody] string title, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, title), cancellationToken).ConfigureAwait(false);
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

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(CreatePlaylistParams))]
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> CreateFromItemsAsync(
        IAsyncCommandHandler<PLCreateFromItemsCommand> handler,
        string deviceId, CreatePlaylistParams playlistParams, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, playlistParams), cancellationToken).ConfigureAwait(false);
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

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(CreateFromFilesFormParams))]
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> CreateFromFilesAsync(
        IAsyncCommandHandler<PLCreateFromFilesCommand> handler,
        string deviceId, [AsParameters] CreateFromFilesFormParams form, CancellationToken cancellationToken)
    {
        try
        {
            var sourceFiles = form.Files.Select(f => new FormFileSource(f));
            var command = new PLCreateFromFilesCommand(deviceId, sourceFiles, form.Title ?? "", form.Merge ?? false, form.UseProxy ?? false);
            await handler.ExecuteAsync(command, cancellationToken).ConfigureAwait(false);
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

    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> RenameAsync(
        IAsyncCommandHandler<PLRenameCommand> handler,
        string deviceId, string playlistId, [FromBody] string title,
        CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, playlistId, title), cancellationToken).ConfigureAwait(false);
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

    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> CopyAsync(
        IAsyncCommandHandler<PLCopyCommand> handler,
        string deviceId, string playlistId, [FromBody] string title,
        CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, playlistId, title), cancellationToken).ConfigureAwait(false);
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

    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> RemoveAsync(
        IAsyncCommandHandler<PLRemoveCommand> handler,
        string deviceId, [FromBody] string[] ids, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, ids), cancellationToken).ConfigureAwait(false);
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

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(MediaSourceParams))]
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> AddItemsAsync(
        IAsyncCommandHandler<PLAddItemsCommand> handler,
        string deviceId, string playlistId, MediaSourceParams source,
        CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, playlistId, source), cancellationToken).ConfigureAwait(false);
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

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(FeedUrlSourceParams))]
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> AddFromFeedsAsync(
        IAsyncCommandHandler<PLAddFeedUrlCommand> handler,
        string deviceId, string playlistId, FeedUrlSourceParams source,
        CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, playlistId, source), cancellationToken).ConfigureAwait(false);
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

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(CreateFromFilesFormParams))]
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> AddFromFilesAsync(
        IAsyncCommandHandler<PLAddPlaylistFilesCommand> handler,
        string deviceId, string playlistId, [AsParameters] CreateFromFilesFormParams form,
        CancellationToken cancellationToken)
    {
        try
        {
            var sources = form.Files.Select(f => new FormFileSource(f));
            await handler.ExecuteAsync(new(deviceId, playlistId, sources, form.UseProxy ?? false), cancellationToken).ConfigureAwait(false);
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

    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> RemoveItemsAsync(
        IAsyncCommandHandler<PLRemoveItemsCommand> handler,
        string deviceId, string playlistId, [FromBody] string[] items,
        CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, playlistId, items), cancellationToken).ConfigureAwait(false);
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

    public static async Task<Results<ContentHttpResult, NotFound, ProblemHttpResult>> GetPlaylistStateAsync(
        IAsyncQueryHandler<SysPropsGetPlaylistStateQuery, string> handler,
        string deviceId, CancellationToken cancellationToken)
    {
        try
        {
            var content = await handler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);
            return Text(content, MediaTypeNames.Application.Json);
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

public readonly record struct CreateFromFilesFormParams(
    IFormFileCollection Files,
    [FromForm] string? Title,
    [FromForm] bool? Merge,
    [FromForm] bool? UseProxy);
