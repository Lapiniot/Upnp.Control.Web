using Microsoft.AspNetCore.Mvc;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

internal static class ControlServices
{
    public static async Task<Results<Ok<AVState>, NotFound, ProblemHttpResult>> GetStateAsync(
        IAsyncQueryHandler<AVGetStateQuery, AVState> handler,
        string deviceId, bool detailed = false, CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId, detailed), cancellationToken).ConfigureAwait(false));
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

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(AVStateParams))]
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> SetStateAsync(
        IAsyncCommandHandler<AVSetStateCommand> handler,
        string deviceId, AVStateParams stateParams, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, stateParams), cancellationToken).ConfigureAwait(false);
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

    public static async Task<Results<Ok<AVPosition>, NotFound, ProblemHttpResult>> GetPositionAsync(
        IAsyncQueryHandler<AVGetPositionQuery, AVPosition> handler,
        string deviceId, bool detailed = false, CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId, detailed), cancellationToken).ConfigureAwait(false));
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

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(AVPositionParams))]
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> SeekAsync(
        IAsyncCommandHandler<AVSetPositionCommand> handler,
        string deviceId, AVPositionParams positionParams, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, positionParams), cancellationToken).ConfigureAwait(false);
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

    public static async Task<Results<Ok<string>, NotFound, ProblemHttpResult>> GetPlayModeAsync(
        IAsyncQueryHandler<AVGetPlayModeQuery, string> handler,
        string deviceId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false));
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

    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> SetPlayModeAsync(
        IAsyncCommandHandler<AVSetPlayModeCommand> handler,
        string deviceId, [FromBody] string mode, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, mode), cancellationToken).ConfigureAwait(false);
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

    public static async Task<Results<Ok<RCVolumeState>, NotFound, ProblemHttpResult>> GetVolumeAsync(
        IAsyncQueryHandler<RCGetVolumeQuery, RCVolumeState> handler,
        string deviceId, bool detailed = false, CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId, detailed), cancellationToken).ConfigureAwait(false));
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

    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> SetVolumeAsync(
        IAsyncCommandHandler<RCSetVolumeCommand> handler,
        string deviceId, [FromBody] uint volume, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, volume), cancellationToken).ConfigureAwait(false);
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

    public static async Task<Results<Ok<bool?>, NotFound, ProblemHttpResult>> GetMuteAsync(
        IAsyncQueryHandler<RCGetMuteQuery, bool?> handler,
        string deviceId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false));
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

    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> SetMuteAsync(
        IAsyncCommandHandler<RCSetMuteCommand> handler,
        string deviceId, [FromBody] bool muted, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, muted), cancellationToken).ConfigureAwait(false);
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
}