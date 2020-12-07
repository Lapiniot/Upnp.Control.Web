using System.Text;
using System.Threading;
using System.Threading.Tasks;
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
        public async Task GetPlaylistStateAsync([FromServices] IAsyncQuery<SysPropsGetPlaylistStateQueryParams, string> query, string deviceId, CancellationToken cancellationToken)
        {
            var content = await query.ExecuteAsync(new SysPropsGetPlaylistStateQueryParams(deviceId), cancellationToken).ConfigureAwait(false);
            HttpContext.Response.Headers.Add("Content-Type", "application/json");
            await HttpContext.Response.BodyWriter.WriteAsync(Encoding.UTF8.GetBytes(content), cancellationToken).ConfigureAwait(false);
            await HttpContext.Response.BodyWriter.CompleteAsync().ConfigureAwait(false);
        }

        #endregion

        [HttpPost]
        public Task CreateAsync([FromServices] IAsyncCommand<PLCreateParams> command,
            string deviceId, [FromBody] string title, CancellationToken cancellationToken)
        {
            return command.ExecuteAsync(new PLCreateParams(deviceId, title), cancellationToken);
        }

        [HttpPut("{playlistId}")]
        public Task UpdateAsync([FromServices] IAsyncCommand<PLUpdateParams> command,
            string deviceId, string playlistId, [FromBody] string title, CancellationToken cancellationToken)
        {
            return command.ExecuteAsync(new PLUpdateParams(deviceId, playlistId, title), cancellationToken);
        }

        [HttpDelete]
        public Task RemoveAsync([FromServices] IAsyncCommand<PLRemoveParams> command,
            string deviceId, [FromBody] string[] ids, CancellationToken cancellationToken)
        {
            return command.ExecuteAsync(new PLRemoveParams(deviceId, ids), cancellationToken);
        }

        [HttpPut("{playlistId}/items")]
        public Task AddItemsAsync([FromServices] IAsyncCommand<PLAddItemsParams> command,
            string deviceId, string playlistId, [FromBody] MediaSource source, CancellationToken cancellationToken)
        {
            return command.ExecuteAsync(new PLAddItemsParams(deviceId, playlistId, source), cancellationToken);
        }

        [HttpDelete("{playlistId}/items")]
        public Task RemoveItemsAsync([FromServices] IAsyncCommand<PLRemoveItemsParams> command,
            string deviceId, string playlistId, [FromBody] string[] items, CancellationToken cancellationToken)
        {
            return command.ExecuteAsync(new PLRemoveItemsParams(deviceId, playlistId, items), cancellationToken);
        }
    }
}