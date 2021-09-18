using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/devices/{deviceId}")]
    public class UpnpControlController : ControllerBase
    {
        #region AVTransport state related

        [HttpGet("state")]
        [Produces("application/json")]
        public Task<AVState> GetStateAsync([FromServices][NotNull] IAsyncQueryHandler<AVGetStateQuery, AVState> handler,
            string deviceId, CancellationToken cancellationToken, [FromQuery] bool? detailed = false)
        {
            return handler.ExecuteAsync(new AVGetStateQuery(deviceId, detailed), cancellationToken);
        }

        [HttpPut("state")]
        [Consumes("application/json")]
        public Task SetStateAsync([FromServices][NotNull] IAsyncCommandHandler<AVSetStateCommand> handler,
            string deviceId, AVStateParams @params, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new AVSetStateCommand(deviceId, @params), cancellationToken);
        }

        #endregion

        #region AVTransport position related

        [HttpGet("position")]
        [Produces("application/json")]
        public Task<AVPosition> GetPositionAsync([FromServices][NotNull] IAsyncQueryHandler<AVGetPositionQuery, AVPosition> handler,
            string deviceId, CancellationToken cancellationToken, bool? detailed = false)
        {
            return handler.ExecuteAsync(new AVGetPositionQuery(deviceId, detailed), cancellationToken);
        }

        [HttpPut("position")]
        [Consumes("application/json")]
        public Task SeekAsync([FromServices][NotNull] IAsyncCommandHandler<AVSetPositionCommand> handler,
            string deviceId, AVPositionParams @params, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new AVSetPositionCommand(deviceId, @params), cancellationToken);
        }

        #endregion

        #region AVTransport play mode related

        [HttpGet("play-mode")]
        [Produces("application/json")]
        public Task<string> GetPlayModeAsync([FromServices][NotNull] IAsyncQueryHandler<AVGetPlayModeQuery, string> handler,
            string deviceId, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new AVGetPlayModeQuery(deviceId), cancellationToken);
        }

        [HttpPut("play-mode")]
        [Consumes("application/json")]
        public Task SetPlayModeAsync([FromServices][NotNull] IAsyncCommandHandler<AVSetPlayModeCommand> handler,
            string deviceId, [FromBody] string mode, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new AVSetPlayModeCommand(deviceId, mode), cancellationToken);
        }

        #endregion

        #region RenderingControl volume related

        [HttpGet("volume")]
        [Produces("application/json")]
        public Task<RCVolumeState> GetVolumeAsync([FromServices][NotNull] IAsyncQueryHandler<RCGetVolumeQuery, RCVolumeState> handler,
            string deviceId, CancellationToken cancellationToken, bool? detailed = false)
        {
            return handler.ExecuteAsync(new RCGetVolumeQuery(deviceId, detailed), cancellationToken);
        }

        [HttpPut("volume")]
        [Consumes("application/json")]
        public Task SetVolumeAsync([FromServices][NotNull] IAsyncCommandHandler<RCSetVolumeCommand> handler,
            string deviceId, [FromBody] uint volume, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new RCSetVolumeCommand(deviceId, volume), cancellationToken);
        }

        #endregion

        #region RenderingControl mute related

        [HttpGet("mute")]
        [Produces("application/json")]
        public Task<bool?> GetMuteAsync([FromServices][NotNull] IAsyncQueryHandler<RCGetMuteQuery, bool?> handler,
            string deviceId, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new RCGetMuteQuery(deviceId), cancellationToken);
        }

        [HttpPut("mute")]
        [Consumes("application/json")]
        public Task SetMuteAsync([FromServices][NotNull] IAsyncCommandHandler<RCSetMuteCommand> handler,
            string deviceId, [FromBody] bool muted, CancellationToken cancellationToken)
        {
            return handler.ExecuteAsync(new RCSetMuteCommand(deviceId, muted), cancellationToken);
        }

        #endregion
    }
}