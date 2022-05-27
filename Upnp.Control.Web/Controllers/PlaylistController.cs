using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;

namespace Upnp.Control.Web.Controllers;

[ApiController]
[Route("api/devices/{deviceId}/playlists")]
[Produces("application/json")]
public class PlaylistController : ControllerBase
{
    #region SystemProperties playlist state related

    [HttpGet("state")]
    [Produces("application/json")]
    public async Task GetPlaylistStateAsync([FromServices][NotNull] IAsyncQueryHandler<SysPropsGetPlaylistStateQuery, string> handler, string deviceId, CancellationToken cancellationToken)
    {
        var content = await handler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false);
        HttpContext.Response.Headers.Add("Content-Type", "application/json");
        _ = await HttpContext.Response.BodyWriter.WriteAsync(Encoding.UTF8.GetBytes(content), cancellationToken).ConfigureAwait(false);
        await HttpContext.Response.BodyWriter.CompleteAsync().ConfigureAwait(false);
    }

    #endregion

    [HttpPost]
    public Task CreateAsync([FromServices][NotNull] IAsyncCommandHandler<PLCreateCommand> handler,
        string deviceId, [FromBody] string title, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, title), cancellationToken);

    [HttpPost("items")]
    public Task CreateAsync([FromServices][NotNull] IAsyncCommandHandler<PLCreateFromItemsCommand> handler,
        string deviceId, [FromBody] CreatePlaylistParams @params, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, @params), cancellationToken);

    [HttpPost("files")]
    [Consumes("multipart/form-data")]
    public Task CreateAsync([FromServices][NotNull] IAsyncCommandHandler<PLCreateFromFilesCommand> handler,
        string deviceId, [FromForm] IEnumerable<IFormFile> files,
        [FromForm] string title, [FromForm] bool? useProxy, [FromForm] bool? merge,
        CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, files.Select(f => new FormFileSource(f)), title, merge, useProxy), cancellationToken);

    [HttpPut("{playlistId}")]
    public Task RenameAsync([FromServices][NotNull] IAsyncCommandHandler<PLRenameCommand> handler,
        string deviceId, string playlistId, [FromBody] string title, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, playlistId, title), cancellationToken);

    [HttpPost("{playlistId}/copy")]
    public Task CopyAsync([FromServices][NotNull] IAsyncCommandHandler<PLCopyCommand> handler,
        string deviceId, string playlistId, [FromBody] string title, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, playlistId, title), cancellationToken);

    [HttpDelete]
    public Task RemoveAsync([FromServices][NotNull] IAsyncCommandHandler<PLRemoveCommand> handler,
        string deviceId, [FromBody] string[] ids, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, ids), cancellationToken);

    [HttpPost("{playlistId}/items")]
    [Consumes("application/json")]
    public Task AddItemsAsync([FromServices][NotNull] IAsyncCommandHandler<PLAddItemsCommand> handler,
        string deviceId, string playlistId, [FromBody] MediaSource source, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, playlistId, source), cancellationToken);

    [HttpPost("{playlistId}/feeds")]
    [Consumes("application/json")]
    public Task AddFromFeedsAsync([FromServices][NotNull] IAsyncCommandHandler<PLAddFeedUrlCommand> handler,
        string deviceId, string playlistId, [FromBody] FeedUrlSource source, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, playlistId, source), cancellationToken);

    [HttpPost("{playlistId}/files")]
    [Consumes("multipart/form-data")]
    public Task AddFromFilesAsync([FromServices][NotNull] IAsyncCommandHandler<PLAddPlaylistFilesCommand> handler,
        string deviceId, string playlistId, [FromForm] IEnumerable<IFormFile> files, [FromForm] bool? useProxy,
        CancellationToken cancellationToken = default) =>
        handler.ExecuteAsync(new(deviceId, playlistId, files.Select(f => new FormFileSource(f)), useProxy), cancellationToken);

    [HttpDelete("{playlistId}/items")]
    public Task RemoveItemsAsync([FromServices][NotNull] IAsyncCommandHandler<PLRemoveItemsCommand> handler,
        string deviceId, string playlistId, [FromBody] string[] items, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, playlistId, items), cancellationToken);
}