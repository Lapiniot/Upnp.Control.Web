using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Controllers
{
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
        /// <param name="cancellationToken">Request cancellation token</param>
        /// <returns>Device information enumerator</returns>
        [HttpGet]
        [Produces("application/json")]
        public IAsyncEnumerable<Device> GetAllAsync([FromServices] IAsyncEnumerableQueryHandler<GetDevicesQuery, Device> handler,
            string category = "upnp", CancellationToken cancellationToken = default)
        {
            return handler.ExecuteAsync(new GetDevicesQuery(category), cancellationToken);
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
        public Task<Device> GetAsync([FromServices] IAsyncQueryHandler<GetDeviceQuery, Device> handler,
            string id, CancellationToken cancellationToken = default)
        {
            return handler.ExecuteAsync(new GetDeviceQuery(id), cancellationToken);
        }
    }
}