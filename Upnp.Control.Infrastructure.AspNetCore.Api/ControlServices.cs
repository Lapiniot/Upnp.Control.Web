namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class ControlServices
{
    public static Task<AVState> GetStateAsync(IAsyncQueryHandler<AVGetStateQuery, AVState> handler,
        string deviceId, bool detailed = false, CancellationToken cancellationToken = default) =>
        handler.ExecuteAsync(new(deviceId, detailed), cancellationToken);

    public static Task SetStateAsync(IAsyncCommandHandler<AVSetStateCommand> handler,
        string deviceId, AVStateParams @params, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, @params), cancellationToken);

    public static Task<AVPosition> GetPositionAsync(IAsyncQueryHandler<AVGetPositionQuery, AVPosition> handler,
        string deviceId, bool detailed = false, CancellationToken cancellationToken = default) =>
        handler.ExecuteAsync(new(deviceId, detailed), cancellationToken);

    public static Task SeekAsync(IAsyncCommandHandler<AVSetPositionCommand> handler,
        string deviceId, AVPositionParams @params, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, @params), cancellationToken);

    public static Task<string> GetPlayModeAsync(IAsyncQueryHandler<AVGetPlayModeQuery, string> handler,
        string deviceId, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId), cancellationToken);

    public static Task SetPlayModeAsync(IAsyncCommandHandler<AVSetPlayModeCommand> handler,
        string deviceId, string mode, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, mode), cancellationToken);

    public static Task<RCVolumeState> GetVolumeAsync(IAsyncQueryHandler<RCGetVolumeQuery, RCVolumeState> handler,
        string deviceId, bool detailed = false, CancellationToken cancellationToken = default) =>
        handler.ExecuteAsync(new(deviceId, detailed), cancellationToken);

    public static Task SetVolumeAsync(IAsyncCommandHandler<RCSetVolumeCommand> handler,
        string deviceId, uint volume, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, volume), cancellationToken);

    public static Task<bool?> GetMuteAsync(IAsyncQueryHandler<RCGetMuteQuery, bool?> handler,
        string deviceId, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId), cancellationToken);

    public static Task SetMuteAsync(IAsyncCommandHandler<RCSetMuteCommand> handler,
        string deviceId, bool muted, CancellationToken cancellationToken) =>
        handler.ExecuteAsync(new(deviceId, muted), cancellationToken);
}