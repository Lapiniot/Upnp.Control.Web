using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Mvc;
using Upnp.Control.Models;
using Upnp.Control.Services;

namespace Web.Upnp.Control.Controllers;

/// <summary>
/// Provides information about UPnP devices discovered and currently available in the network
/// </summary>
[ApiController]
[Route("api/devices")]
[Produces("application/json")]
public class DeviceController : ControllerBase
{
    /// <summary>
    /// Provides the list of all available UPnP devices that belong to the <paramref name="category" />
    /// </summary>
    /// <param name="handler">Query implementation</param>
    /// <param name="category">Device category filter</param>
    /// <param name="withOffline">Include offline devices</param>
    /// <param name="cancellationToken">Request cancellation token</param>
    /// <returns>Device information enumerator</returns>
    [HttpGet]
    [Produces("application/json")]
    public IAsyncEnumerable<UpnpDevice> GetAllAsync([FromServices][NotNull] IAsyncEnumerableQueryHandler<GetDevicesQuery, UpnpDevice> handler,
        string category = "upnp", bool? withOffline = false, CancellationToken cancellationToken = default)
    {
        return handler.ExecuteAsync(new GetDevicesQuery(category, withOffline != false), cancellationToken);
    }

    /// <summary>
    /// Provides information about UPnP device with <paramref name="id" /> unique id
    /// </summary>
    /// <param name="handler">Query implementation</param>
    /// <param name="id">Device id</param>
    /// <param name="cancellationToken">Request cancellation token</param>
    /// <returns>Device information</returns>
    [HttpGet("{id}")]
    [Produces("application/json")]
    public Task<UpnpDevice> GetAsync([FromServices][NotNull] IAsyncQueryHandler<GetDeviceQuery, UpnpDevice> handler,
        string id, CancellationToken cancellationToken = default)
    {
        return handler.ExecuteAsync(new GetDeviceQuery(id), cancellationToken);
    }
}