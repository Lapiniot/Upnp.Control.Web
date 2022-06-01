using Microsoft.AspNetCore.Mvc;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class PlaylistServices
{
    public static async Task<Results<NoContent, NotFound, BadRequest>> CreateAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> CreateFromItemsAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> CreateFromFilesAsync(
        IAsyncCommandHandler<PLCreateFromFilesCommand> handler,
        string deviceId, CreateFromFilesForm form, CancellationToken cancellationToken)
    {
        try
        {
            var sourceFiles = form.Files.Select(f => new FormFileSource(f));
            var command = new PLCreateFromFilesCommand(deviceId, sourceFiles, form.Title, form.Merge, form.UseProxy);
            await handler.ExecuteAsync(command, cancellationToken).ConfigureAwait(false);
            return NoContent();
        }
        catch (DeviceNotFoundException)
        {
            return NotFound();
        }
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> RenameAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> CopyAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> RemoveAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> AddItemsAsync(
        IAsyncCommandHandler<PLAddItemsCommand> handler,
        string deviceId, string playlistId, MediaSource source,
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> AddFromFeedsAsync(
        IAsyncCommandHandler<PLAddFeedUrlCommand> handler,
        string deviceId, string playlistId, FeedUrlSource source,
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> AddFromFilesAsync(
        IAsyncCommandHandler<PLAddPlaylistFilesCommand> handler,
        string deviceId, string playlistId, CreateFromFilesForm form,
        CancellationToken cancellationToken)
    {
        try
        {
            var sources = form.Files.Select(f => new FormFileSource(f));
            await handler.ExecuteAsync(new(deviceId, playlistId, sources, form.UseProxy), cancellationToken).ConfigureAwait(false);
            return NoContent();
        }
        catch (DeviceNotFoundException)
        {
            return NotFound();
        }
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> RemoveItemsAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<ContentHttpResult, NotFound, BadRequest>> GetPlaylistStateAsync(
        IAsyncQueryHandler<SysPropsGetPlaylistStateQuery, string> handler,
        string deviceId, CancellationToken cancellationToken)
    {
        try
        {
            var content = await handler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);
            return Text(content, "application/json");
        }
        catch (DeviceNotFoundException)
        {
            return NotFound();
        }
        catch
        {
            return BadRequest();
        }
    }
}

public readonly record struct CreateFromFilesForm(IFormFileCollection Files, string Title, bool Merge, bool UseProxy)
{
    public static ValueTask<CreateFromFilesForm> BindAsync(HttpContext context)
    {
        var form = context.Request.Form;
        return new(new CreateFromFilesForm(form.Files,
            form.TryGetValue("Title", out var v) && v is [{ } str, ..] ? str : "",
            form.TryGetValue("Merge", out v) && v is [{ } mstr, ..] && bool.TryParse(mstr, out var b) && b,
            form.TryGetValue("UseProxy", out v) && v is [{ } pstr, ..] && bool.TryParse(pstr, out b) && b));
    }
}
