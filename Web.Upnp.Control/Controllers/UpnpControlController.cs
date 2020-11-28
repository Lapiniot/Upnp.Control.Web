using System.Text;
using System.Threading;
using System.Threading.Tasks;
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
        public Task<AVState> GetStateAsync([FromServices] IAsyncQuery<AVGetStateQueryParams, AVState> query, string deviceId, CancellationToken cancellationToken, [FromQuery] bool? detailed = false)
        {
            return query.ExecuteAsync(new AVGetStateQueryParams(deviceId, detailed), cancellationToken);
        }

        [HttpPut("state")]
        [Consumes("application/json")]
        public Task SetStateAsync([FromServices] IAsyncCommand<AVSetStateCommandParams> command, string deviceId, AVStateParams @params, CancellationToken cancellationToken)
        {
            return command.ExecuteAsync(new AVSetStateCommandParams(deviceId, @params), cancellationToken);
        }

        #endregion

        #region AVTransport position related

        [HttpGet("position")]
        [Produces("application/json")]
        public Task<AVPosition> GetPositionAsync([FromServices] IAsyncQuery<AVGetPositionQueryParams, AVPosition> query, string deviceId, CancellationToken cancellationToken, bool? detailed = false)
        {
            return query.ExecuteAsync(new AVGetPositionQueryParams(deviceId, detailed), cancellationToken);
        }

        [HttpPut("position")]
        [Consumes("application/json")]
        public Task SeekAsync([FromServices] IAsyncCommand<AVSetPositionCommandParams> command, string deviceId, AVPositionParams @params, CancellationToken cancellationToken)
        {
            return command.ExecuteAsync(new AVSetPositionCommandParams(deviceId, @params), cancellationToken);
        }

        #endregion

        #region AVTransport play mode related

        [HttpGet("play-mode")]
        [Produces("application/json")]
        public Task<string> GetPlayModeAsync([FromServices] IAsyncQuery<AVGetPlayModeQueryParams, string> query, string deviceId, CancellationToken cancellationToken)
        {
            return query.ExecuteAsync(new AVGetPlayModeQueryParams(deviceId), cancellationToken);
        }

        [HttpPut("play-mode")]
        [Consumes("application/json")]
        public Task SetPlayModeAsync([FromServices] IAsyncCommand<AVSetPlayModeCommandParams> command, string deviceId, [FromBody] string mode, CancellationToken cancellationToken)
        {
            return command.ExecuteAsync(new AVSetPlayModeCommandParams(deviceId, mode), cancellationToken);
        }

        #endregion

        #region RenderingControl volume related

        [HttpGet("volume")]
        [Produces("application/json")]
        public Task<RCVolumeState> GetVolumeAsync([FromServices] IAsyncQuery<RCGetVolumeQueryParams, RCVolumeState> query, string deviceId, CancellationToken cancellationToken, bool? detailed = false)
        {
            return query.ExecuteAsync(new RCGetVolumeQueryParams(deviceId, detailed), cancellationToken);
        }

        [HttpPut("volume")]
        [Consumes("application/json")]
        public Task SetVolumeAsync([FromServices] IAsyncCommand<RCSetVolumeCommandParams> command, string deviceId, [FromBody] uint volume, CancellationToken cancellationToken)
        {
            return command.ExecuteAsync(new RCSetVolumeCommandParams(deviceId, volume), cancellationToken);
        }

        #endregion

        #region RenderingControl mute related

        [HttpGet("mute")]
        [Produces("application/json")]
        public Task<bool?> GetMuteAsync([FromServices] IAsyncQuery<RCGetMuteQueryParams, bool?> query, string deviceId, CancellationToken cancellationToken)
        {
            return query.ExecuteAsync(new RCGetMuteQueryParams(deviceId), cancellationToken);
        }

        [HttpPut("mute")]
        [Consumes("application/json")]
        public Task SetMuteAsync([FromServices] IAsyncCommand<RCSetMuteCommandParams> command, string deviceId, [FromBody] bool muted, CancellationToken cancellationToken)
        {
            return command.ExecuteAsync(new RCSetMuteCommandParams(deviceId, muted), cancellationToken);
        }

        #endregion
    }
}