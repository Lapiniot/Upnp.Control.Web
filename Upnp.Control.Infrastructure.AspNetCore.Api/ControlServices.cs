using Microsoft.AspNetCore.Mvc;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class ControlServices
{
    public static async Task<Results<Ok<AVState>, NotFound, BadRequest>> GetStateAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(AVStateParams))]
    public static async Task<Results<NoContent, NotFound, BadRequest>> SetStateAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<Ok<AVPosition>, NotFound, BadRequest>> GetPositionAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(AVPositionParams))]
    public static async Task<Results<NoContent, NotFound, BadRequest>> SeekAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<Ok<string>, NotFound, BadRequest>> GetPlayModeAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> SetPlayModeAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<Ok<RCVolumeState>, NotFound, BadRequest>> GetVolumeAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> SetVolumeAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<Ok<bool?>, NotFound, BadRequest>> GetMuteAsync(
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
        catch
        {
            return BadRequest();
        }
    }

    public static async Task<Results<NoContent, NotFound, BadRequest>> SetMuteAsync(
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
        catch
        {
            return BadRequest();
        }
    }
}