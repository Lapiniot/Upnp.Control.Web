using System.Diagnostics.CodeAnalysis;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Controllers
{
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
            var content = await handler.ExecuteAsync(new SysPropsGetPlaylistStateQuery(deviceId), cancellationToken).ConfigureAwait(false);
            HttpContext.Response.Headers.Add("Content-Type", "application/json");
            await HttpContext.Response.BodyWriter.WriteAsync(Encoding.UTF8.GetBytes(content), cancellationToken).ConfigureAwait(false);
            await HttpContext.Response.BodyWriter.CompleteAsync().ConfigureAwait(false);
        }

        #endregion

        [HttpPost]
        public Task CreateAsync([FromServices][NotNull] IAsyncCommandHandler<PLCreateCommand> handler,
            string deviceId, [FromBody] string title, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new PLCreateCommand(deviceId, title), cancellationToken);
        }

        [HttpPost("items")]
        public Task CreateAsync([FromServices][NotNull] IAsyncCommandHandler<PLCreateFromItemsCommand> handler,
            string deviceId, [FromBody] CreatePlaylistParams @params, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new PLCreateFromItemsCommand(deviceId, @params), cancellationToken);
        }

        [HttpPost("files")]
        [Consumes("multipart/form-data")]
        public Task CreateAsync([FromServices][NotNull] IAsyncCommandHandler<PLCreateFromFilesCommand> handler,
            string deviceId, [FromForm] PlaylistFilesSource source, [FromForm] string title, [FromForm] bool? merge,
            CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new PLCreateFromFilesCommand(deviceId, source, title, merge), cancellationToken);
        }

        [HttpPut("{playlistId}")]
        public Task RenameAsync([FromServices][NotNull] IAsyncCommandHandler<PLRenameCommand> handler,
            string deviceId, string playlistId, [FromBody] string title, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new PLRenameCommand(deviceId, playlistId, title), cancellationToken);
        }

        [HttpPost("{playlistId}/copy")]
        public Task CopyAsync([FromServices][NotNull] IAsyncCommandHandler<PLCopyCommand> handler,
            string deviceId, string playlistId, [FromBody] string title, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new PLCopyCommand(deviceId, playlistId, title), cancellationToken);
        }

        [HttpDelete]
        public Task RemoveAsync([FromServices][NotNull] IAsyncCommandHandler<PLRemoveCommand> handler,
            string deviceId, [FromBody] string[] ids, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new PLRemoveCommand(deviceId, ids), cancellationToken);
        }

        [HttpPost("{playlistId}/items")]
        [Consumes("application/json")]
        public Task AddItemsAsync([FromServices][NotNull] IAsyncCommandHandler<PLAddItemsCommand> handler,
            string deviceId, string playlistId, [FromBody] MediaSource source, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new PLAddItemsCommand(deviceId, playlistId, source), cancellationToken);
        }

        [HttpPost("{playlistId}/feeds")]
        [Consumes("application/json")]
        public Task AddFromFeedsAsync([FromServices][NotNull] IAsyncCommandHandler<PLAddFeedUrlCommand> handler,
            string deviceId, string playlistId, [FromBody] FeedUrlSource source, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new PLAddFeedUrlCommand(deviceId, playlistId, source), cancellationToken);
        }

        [HttpPost("{playlistId}/files")]
        [Consumes("multipart/form-data")]
        public Task AddFromFilesAsync([FromServices][NotNull] IAsyncCommandHandler<PLAddPlaylistFilesCommand> handler,
            string deviceId, string playlistId, [FromForm] PlaylistFilesSource source, CancellationToken cancellationToken = default)
        {
            return handler.ExecuteAsync(new PLAddPlaylistFilesCommand(deviceId, playlistId, source), cancellationToken);
        }

        [HttpDelete("{playlistId}/items")]
        public Task RemoveItemsAsync([FromServices][NotNull] IAsyncCommandHandler<PLRemoveItemsCommand> handler,
            string deviceId, string playlistId, [FromBody] string[] items, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new PLRemoveItemsCommand(deviceId, playlistId, items), cancellationToken);
        }
    }
}