using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/devices")]
    [Produces("application/json")]
    public class DeviceController : ControllerBase
    {
        [HttpGet]
        [Produces("application/json")]
        public IAsyncEnumerable<Device> GetAllAsync([FromServices] IAsyncEnumerableQuery<GetDevicesQueryParams, Device> query,
            string category = "upnp", CancellationToken cancellationToken = default)
        {
            return query.ExecuteAsync(new GetDevicesQueryParams(category), cancellationToken);
        }

        [HttpGet("{id}")]
        [Produces("application/json")]
        public Task<Device> GetAsync([FromServices] IAsyncQuery<GetDeviceQueryParams, Device> query,
            string id, CancellationToken cancellationToken = default)
        {
            return query.ExecuteAsync(new GetDeviceQueryParams(id), cancellationToken);
        }
    }
}