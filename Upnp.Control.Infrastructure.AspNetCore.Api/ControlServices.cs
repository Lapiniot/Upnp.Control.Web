using Microsoft.AspNetCore.Mvc;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

/// <summary>
/// Provides methods for handling UPnP control operations through ASP.NET Core API endpoints.
/// </summary>
public static class ControlServices
{
    /// <summary>
    /// Retrieves the current state of an AV (Audio/Video) device.
    /// </summary>
    /// <param name="handler">The query handler for executing AV state queries.</param>
    /// <param name="deviceId">The unique identifier of the device.</param>
    /// <param name="detailed">Indicates whether to return detailed state information.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - Ok{AVState}: The current state of the device
    /// - NotFound: If the device was not found
    /// - ProblemHttpResult: If an error occurred during the operation
    /// </returns>
    /// <response code="200">Returns requested state information.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<Ok<AVState>, NotFound, ProblemHttpResult>> GetStateAsync(
        IQueryHandler<AVGetStateQuery, AVState> handler,
        string deviceId, bool detailed = false, CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId, detailed), cancellationToken));
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

    /// <summary>
    /// Sets the state of an AV (Audio/Video) device.
    /// </summary>
    /// <param name="handler">The command handler for executing AV state commands.</param>
    /// <param name="deviceId">The unique identifier of the device.</param>
    /// <param name="stateParams">The state parameters to set.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - NoContent: If the state was successfully set
    /// - NotFound: If the device was not found
    /// - ProblemHttpResult: If an error occurred during the operation
    /// </returns>
    /// <response code="204">If the state was successfully set</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(AVStateParams))]
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> SetStateAsync(
        ICommandHandler<AVSetStateCommand> handler,
        string deviceId, AVStateParams stateParams, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, stateParams), cancellationToken);
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

    /// <summary>
    /// Retrieves the current position of an AV (Audio/Video) device.
    /// </summary>
    /// <param name="handler">The query handler for executing AV position queries.</param>
    /// <param name="deviceId">The unique identifier of the device.</param>
    /// <param name="detailed">Indicates whether to return detailed position information.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - Ok{AVPosition}: The current position of the device
    /// - NotFound: If the device was not found
    /// - ProblemHttpResult: If an error occurred during the operation
    /// </returns>
    /// <response code="200">Returns requested position information.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<Ok<AVPosition>, NotFound, ProblemHttpResult>> GetPositionAsync(
        IQueryHandler<AVGetPositionQuery, AVPosition> handler,
        string deviceId, bool detailed = false, CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId, detailed), cancellationToken));
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

    /// <summary>
    /// Seeks to a specific position in an AV (Audio/Video) device.
    /// </summary>
    /// <param name="handler">The command handler for executing AV position commands.</param>
    /// <param name="deviceId">The unique identifier of the device.</param>
    /// <param name="positionParams">The position parameters to seek to.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - NoContent: If the seek operation was successful
    /// - NotFound: If the device was not found
    /// - ProblemHttpResult: If an error occurred during the operation
    /// </returns>
    /// <response code="204">If the seek operation was successful.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(AVPositionParams))]
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> SeekAsync(
        ICommandHandler<AVSetPositionCommand> handler,
        string deviceId, AVPositionParams positionParams, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, positionParams), cancellationToken);
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

    /// <summary>
    /// Retrieves the current play mode of an AV (Audio/Video) device.
    /// </summary>
    /// <param name="handler">The query handler for executing AV play mode queries.</param>
    /// <param name="deviceId">The unique identifier of the device.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - Ok{string}: The current play mode of the device
    /// - NotFound: If the device was not found
    /// - ProblemHttpResult: If an error occurred during the operation
    /// </returns>
    /// <response code="200">Returns requested play mode information.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<Ok<string>, NotFound, ProblemHttpResult>> GetPlayModeAsync(
        IQueryHandler<AVGetPlayModeQuery, string> handler,
        string deviceId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId), cancellationToken));
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

    /// <summary>
    /// Sets the play mode of an AV (Audio/Video) device.
    /// </summary>
    /// <param name="handler">The command handler for executing AV play mode commands.</param>
    /// <param name="deviceId">The unique identifier of the device.</param>
    /// <param name="mode">The play mode to set.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - NoContent: If the play mode was successfully set
    /// - NotFound: If the device was not found
    /// - ProblemHttpResult: If an error occurred during the operation
    /// </returns>
    /// <response code="204">If the play mode was successfully set.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> SetPlayModeAsync(
        ICommandHandler<AVSetPlayModeCommand> handler,
        string deviceId, [FromBody] string mode, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, mode), cancellationToken);
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

    /// <summary>
    /// Retrieves the current volume of an RC (Remote Control) device.
    /// </summary>
    /// <param name="handler">The query handler for executing RC volume queries.</param>
    /// <param name="deviceId">The unique identifier of the device.</param>
    /// <param name="detailed">Indicates whether to return detailed volume information.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - Ok{RCVolumeState}: The current volume state of the device
    /// - NotFound: If the device was not found
    /// - ProblemHttpResult: If an error occurred during the operation
    /// </returns>
    /// <response code="200">Returns requested volume information.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<Ok<RCVolumeState>, NotFound, ProblemHttpResult>> GetVolumeAsync(
        IQueryHandler<RCGetVolumeQuery, RCVolumeState> handler,
        string deviceId, bool detailed = false, CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId, detailed), cancellationToken));
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

    /// <summary>
    /// Sets the volume of an RC (Remote Control) device.
    /// </summary>
    /// <param name="handler">The command handler for executing RC volume commands.</param>
    /// <param name="deviceId">The unique identifier of the device.</param>
    /// <param name="volume">The volume level to set (0-100).</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - NoContent: If the volume was successfully set
    /// - NotFound: If the device was not found
    /// - ProblemHttpResult: If an error occurred during the operation
    /// </returns>
    /// <response code="204">If the volume was successfully set.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> SetVolumeAsync(
        ICommandHandler<RCSetVolumeCommand> handler,
        string deviceId, [FromBody] uint volume, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, volume), cancellationToken);
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

    /// <summary>
    /// Retrieves the current mute state of an RC (Remote Control) device.
    /// </summary>
    /// <param name="handler">The query handler for executing RC mute queries.</param>
    /// <param name="deviceId">The unique identifier of the device.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - Ok{bool?}: The current mute state of the device (true=muted, false=unmuted, null=unknown)
    /// - NotFound: If the device was not found
    /// - ProblemHttpResult: If an error occurred during the operation
    /// </returns>
    /// <response code="200">Returns requested mute information.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<Ok<bool?>, NotFound, ProblemHttpResult>> GetMuteAsync(
        IQueryHandler<RCGetMuteQuery, bool?> handler,
        string deviceId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await handler.ExecuteAsync(new(deviceId), cancellationToken));
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

    /// <summary>
    /// Sets the mute state of an RC (Remote Control) device.
    /// </summary>
    /// <param name="handler">The command handler for executing RC mute commands.</param>
    /// <param name="deviceId">The unique identifier of the device.</param>
    /// <param name="muted">The mute state to set (true=muted, false=unmuted).</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>
    /// A Results object containing either:
    /// - NoContent: If the mute state was successfully set
    /// - NotFound: If the device was not found
    /// - ProblemHttpResult: If an error occurred during the operation
    /// </returns>
    /// <response code="204">If the mute state was successfully set.</response>
    /// <response code="404">If requested device was not found.</response>
    /// <response code="500">If any other unspecified error occured.</response>
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> SetMuteAsync(
        ICommandHandler<RCSetMuteCommand> handler,
        string deviceId, [FromBody] bool muted, CancellationToken cancellationToken)
    {
        try
        {
            await handler.ExecuteAsync(new(deviceId, muted), cancellationToken);
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