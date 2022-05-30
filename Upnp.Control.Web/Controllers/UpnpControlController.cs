using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Abstractions;
using Upnp.Control.Infrastructure.AspNetCore.Api;

namespace Upnp.Control.Web.Controllers;

[ApiController]
[Route("api/devices/{deviceId}")]
public class UpnpControlController : ControllerBase
{
    #region AVTransport state related

    [HttpGet("state")]
    [Produces("application/json")]
    public Task<AVState> GetStateAsync([FromServices][NotNull] IAsyncQueryHandler<AVGetStateQuery, AVState> handler,
        string deviceId, CancellationToken cancellationToken, [FromQuery] bool detailed = false) =>
        ControlServices.GetStateAsync(handler, deviceId, detailed, cancellationToken);

    [HttpPut("state")]
    [Consumes("application/json")]
    public Task SetStateAsync([FromServices][NotNull] IAsyncCommandHandler<AVSetStateCommand> handler,
        string deviceId, AVStateParams @params, CancellationToken cancellationToken) =>
        ControlServices.SetStateAsync(handler, deviceId, @params, cancellationToken);

    #endregion

    #region AVTransport position related

    [HttpGet("position")]
    [Produces("application/json")]
    public Task<AVPosition> GetPositionAsync([FromServices][NotNull] IAsyncQueryHandler<AVGetPositionQuery, AVPosition> handler,
        string deviceId, CancellationToken cancellationToken, bool detailed = false) =>
        ControlServices.GetPositionAsync(handler, deviceId, detailed, cancellationToken);

    [HttpPut("position")]
    [Consumes("application/json")]
    public Task SeekAsync([FromServices][NotNull] IAsyncCommandHandler<AVSetPositionCommand> handler,
        string deviceId, AVPositionParams @params, CancellationToken cancellationToken) =>
        ControlServices.SeekAsync(handler, deviceId, @params, cancellationToken);

    #endregion

    #region AVTransport play mode related

    [HttpGet("play-mode")]
    [Produces("application/json")]
    public Task<string> GetPlayModeAsync([FromServices][NotNull] IAsyncQueryHandler<AVGetPlayModeQuery, string> handler,
        string deviceId, CancellationToken cancellationToken) =>
        ControlServices.GetPlayModeAsync(handler, deviceId, cancellationToken);

    [HttpPut("play-mode")]
    [Consumes("application/json")]
    public Task SetPlayModeAsync([FromServices][NotNull] IAsyncCommandHandler<AVSetPlayModeCommand> handler,
        string deviceId, [FromBody] string mode, CancellationToken cancellationToken) =>
        ControlServices.SetPlayModeAsync(handler, deviceId, mode, cancellationToken);

    #endregion

    #region RenderingControl volume related

    [HttpGet("volume")]
    [Produces("application/json")]
    public Task<RCVolumeState> GetVolumeAsync([FromServices][NotNull] IAsyncQueryHandler<RCGetVolumeQuery, RCVolumeState> handler,
        string deviceId, CancellationToken cancellationToken, bool detailed = false) =>
        ControlServices.GetVolumeAsync(handler, deviceId, detailed, cancellationToken);

    [HttpPut("volume")]
    [Consumes("application/json")]
    public Task SetVolumeAsync([FromServices][NotNull] IAsyncCommandHandler<RCSetVolumeCommand> handler,
        string deviceId, [FromBody] uint volume, CancellationToken cancellationToken) =>
        ControlServices.SetVolumeAsync(handler, deviceId, volume, cancellationToken);

    #endregion

    #region RenderingControl mute related

    [HttpGet("mute")]
    [Produces("application/json")]
    public Task<bool?> GetMuteAsync([FromServices][NotNull] IAsyncQueryHandler<RCGetMuteQuery, bool?> handler,
        string deviceId, CancellationToken cancellationToken) =>
        ControlServices.GetMuteAsync(handler, deviceId, cancellationToken);

    [HttpPut("mute")]
    [Consumes("application/json")]
    public Task SetMuteAsync([FromServices][NotNull] IAsyncCommandHandler<RCSetMuteCommand> handler,
        string deviceId, [FromBody] bool muted, CancellationToken cancellationToken) =>
        ControlServices.SetMuteAsync(handler, deviceId, muted, cancellationToken);

    #endregion
}