using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;
using Upnp.Control.Infrastructure.AspNetCore.Api;

namespace Upnp.Control.Web.Controllers;

[ApiController]
[Route("api/devices/{deviceId}/playlists")]
[Produces("application/json")]
public class PlaylistController : ControllerBase
{
    #region SystemProperties playlist state related

    [HttpGet("state")]
    [Produces("application/json")]
    public Task GetPlaylistStateAsync([FromServices][NotNull] IAsyncQueryHandler<SysPropsGetPlaylistStateQuery, string> handler,
        string deviceId, CancellationToken cancellationToken) =>
        PlaylistServices.GetPlaylistStateAsync(handler, deviceId, HttpContext.Response, cancellationToken);

    #endregion

    [HttpPost]
    public Task CreateAsync([FromServices][NotNull] IAsyncCommandHandler<PLCreateCommand> handler,
        string deviceId, [FromBody] string title, CancellationToken cancellationToken) =>
        PlaylistServices.CreateAsync(handler, deviceId, title, cancellationToken);

    [HttpPost("items")]
    public Task CreateAsync([FromServices][NotNull] IAsyncCommandHandler<PLCreateFromItemsCommand> handler,
        string deviceId, [FromBody] CreatePlaylistParams @params, CancellationToken cancellationToken) =>
        PlaylistServices.CreateAsync(handler, deviceId, @params, cancellationToken);

    [HttpPost("files")]
    [Consumes("multipart/form-data")]
    public Task CreateAsync([FromServices][NotNull] IAsyncCommandHandler<PLCreateFromFilesCommand> handler,
        string deviceId, [FromForm] IEnumerable<IFormFile> files,
        [FromForm] string title, [FromForm] bool useProxy = false, [FromForm] bool merge = false,
        CancellationToken cancellationToken = default) =>
        PlaylistServices.CreateAsync(handler, deviceId, files, title, useProxy, merge, cancellationToken);

    [HttpPut("{playlistId}")]
    public Task RenameAsync([FromServices][NotNull] IAsyncCommandHandler<PLRenameCommand> handler,
        string deviceId, string playlistId, [FromBody] string title, CancellationToken cancellationToken) =>
        PlaylistServices.RenameAsync(handler, deviceId, playlistId, title, cancellationToken);

    [HttpPost("{playlistId}/copy")]
    public Task CopyAsync([FromServices][NotNull] IAsyncCommandHandler<PLCopyCommand> handler,
        string deviceId, string playlistId, [FromBody] string title, CancellationToken cancellationToken) =>
        PlaylistServices.CopyAsync(handler, deviceId, playlistId, title, cancellationToken);

    [HttpDelete]
    public Task RemoveAsync([FromServices][NotNull] IAsyncCommandHandler<PLRemoveCommand> handler,
        string deviceId, [FromBody] string[] ids, CancellationToken cancellationToken) =>
        PlaylistServices.RemoveAsync(handler, deviceId, ids, cancellationToken);

    [HttpPost("{playlistId}/items")]
    [Consumes("application/json")]
    public Task AddItemsAsync([FromServices][NotNull] IAsyncCommandHandler<PLAddItemsCommand> handler,
        string deviceId, string playlistId, [FromBody] MediaSource source, CancellationToken cancellationToken) =>
        PlaylistServices.AddItemsAsync(handler, deviceId, playlistId, source, cancellationToken);

    [HttpPost("{playlistId}/feeds")]
    [Consumes("application/json")]
    public Task AddFromFeedsAsync([FromServices][NotNull] IAsyncCommandHandler<PLAddFeedUrlCommand> handler,
        string deviceId, string playlistId, [FromBody] FeedUrlSource source, CancellationToken cancellationToken) =>
        PlaylistServices.AddFromFeedsAsync(handler, deviceId, playlistId, source, cancellationToken);

    [HttpPost("{playlistId}/files")]
    [Consumes("multipart/form-data")]
    public Task AddFromFilesAsync([FromServices][NotNull] IAsyncCommandHandler<PLAddPlaylistFilesCommand> handler,
        string deviceId, string playlistId, [FromForm] IEnumerable<IFormFile> files, [FromForm] bool useProxy = false,
        CancellationToken cancellationToken = default) =>
        PlaylistServices.AddFromFilesAsync(handler, deviceId, playlistId, files, useProxy, cancellationToken);

    [HttpDelete("{playlistId}/items")]
    public Task RemoveItemsAsync([FromServices][NotNull] IAsyncCommandHandler<PLRemoveItemsCommand> handler,
        string deviceId, string playlistId, [FromBody] string[] items, CancellationToken cancellationToken) =>
        PlaylistServices.RemoveItemsAsync(handler, deviceId, playlistId, items, cancellationToken);
}