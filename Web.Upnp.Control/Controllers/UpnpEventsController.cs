using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/events/{deviceId}")]
    [Produces("application/json")]
    public class UpnpEventsController : ControllerBase
    {
        [HttpGet("[action]/{service}")]
        [HttpNotify("[action]")]
        public async Task<object> NotifyAsync(string deviceId, string service)
        {
            using var reader = new StreamReader(HttpContext.Request.Body);
            Debug.WriteLine(await reader.ReadToEndAsync().ConfigureAwait(false));
            return Task.FromResult((object)new object[] { new { deviceId, service }, "string1", "string2" });
        }
    }
}