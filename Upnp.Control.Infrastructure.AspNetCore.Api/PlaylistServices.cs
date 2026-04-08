using Microsoft.AspNetCore.Mvc;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

/// <summary>
/// Provides methods for playlist-related operations.
/// </summary>
public static class PlaylistServices
{
    /// <summary>
    /// Creates a new playlist on the specified device.
    /// </summary>
    /// <param name="handler">The command handler to execute the playlist creation.</param>
    /// <param name="deviceId">The unique identifier of the device to create the playlist on.</param>
    /// <param name="title">The title for the new playlist.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The playlist was successfully created.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
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

    /// <summary>
    /// Creates a new playlist from a collection of media items.
    /// </summary>
    /// <param name="handler">The command handler to execute the playlist creation.</param>
    /// <param name="deviceId">The unique identifier of the device to create the playlist on.</param>
    /// <param name="playlistParams">The parameters containing the playlist items and metadata.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The playlist was successfully created from items.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
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

    /// <summary>
    /// Creates a new playlist from uploaded files.
    /// </summary>
    /// <param name="handler">The command handler to execute the playlist creation.</param>
    /// <param name="deviceId">The unique identifier of the device to create the playlist on.</param>
    /// <param name="form">The form parameters containing the files and playlist options.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The playlist was successfully created from files.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
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

    /// <summary>
    /// Renames an existing playlist.
    /// </summary>
    /// <param name="handler">The command handler to execute the playlist rename.</param>
    /// <param name="deviceId">The unique identifier of the device containing the playlist.</param>
    /// <param name="playlistId">The unique identifier of the playlist to rename.</param>
    /// <param name="title">The new title for the playlist.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The playlist was successfully renamed.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
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

    /// <summary>
    /// Copies an existing playlist with a new title.
    /// </summary>
    /// <param name="handler">The command handler to execute the playlist copy.</param>
    /// <param name="deviceId">The unique identifier of the device containing the playlist.</param>
    /// <param name="playlistId">The unique identifier of the playlist to copy.</param>
    /// <param name="title">The title for the new copied playlist.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The playlist was successfully copied.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
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

    /// <summary>
    /// Removes one or more playlists from the device.
    /// </summary>
    /// <param name="handler">The command handler to execute the playlist removal.</param>
    /// <param name="deviceId">The unique identifier of the device containing the playlists.</param>
    /// <param name="ids">The array of playlist identifiers to remove.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The playlists were successfully removed.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
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

    /// <summary>
    /// Adds media items to an existing playlist.
    /// </summary>
    /// <param name="handler">The command handler to execute the item addition.</param>
    /// <param name="deviceId">The unique identifier of the device containing the playlist.</param>
    /// <param name="playlistId">The unique identifier of the playlist to add items to.</param>
    /// <param name="source">The media source parameters containing the items to add.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The items were successfully added to the playlist.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
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

    /// <summary>
    /// Adds media items from feeds to an existing playlist.
    /// </summary>
    /// <param name="handler">The command handler to execute the feed addition.</param>
    /// <param name="deviceId">The unique identifier of the device containing the playlist.</param>
    /// <param name="playlistId">The unique identifier of the playlist to add feed items to.</param>
    /// <param name="source">The feed URL source parameters containing the feeds to add.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The feed items were successfully added to the playlist.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
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

    /// <summary>
    /// Adds uploaded files to an existing playlist.
    /// </summary>
    /// <param name="handler">The command handler to execute the file addition.</param>
    /// <param name="deviceId">The unique identifier of the device containing the playlist.</param>
    /// <param name="playlistId">The unique identifier of the playlist to add files to.</param>
    /// <param name="form">The form parameters containing the files and options.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The files were successfully added to the playlist.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
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

    /// <summary>
    /// Removes items from an existing playlist.
    /// </summary>
    /// <param name="handler">The command handler to execute the item removal.</param>
    /// <param name="deviceId">The unique identifier of the device containing the playlist.</param>
    /// <param name="playlistId">The unique identifier of the playlist to remove items from.</param>
    /// <param name="items">The array of item identifiers to remove.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either NoContent on success, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="204">The items were successfully removed from the playlist.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
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

    /// <summary>
    /// Gets the current state of the playlist system on the device.
    /// </summary>
    /// <param name="handler">The query handler to execute the playlist state retrieval.</param>
    /// <param name="deviceId">The unique identifier of the device to get the playlist state from.</param>
    /// <param name="cancellationToken">The cancellation token to handle cancellation requests.</param>
    /// <returns>A Task that resolves to a Results object containing either the playlist state content, NotFound if the device is not found, or ProblemHttpResult in case of an error.</returns>
    /// <response code="200">The playlist state was successfully retrieved.</response>
    /// <response code="404">The specified device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
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

/// <summary>
/// Parameters for creating a playlist from files via form upload.
/// </summary>
/// <param name="Files">The collection of files to add to the playlist.</param>
/// <param name="Title">The optional title for the playlist.</param>
/// <param name="Merge">Whether to merge the files with existing playlist items.</param>
/// <param name="UseProxy">Whether to use a proxy for downloading the files.</param>
public readonly record struct CreateFromFilesFormParams(IFormFileCollection Files, [FromForm] string? Title,
    [FromForm] bool? Merge, [FromForm] bool? UseProxy);