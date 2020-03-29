using System.Diagnostics;
using System.Threading.Tasks;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/events/{deviceId}")]
    [Produces("application/json")]
    [Consumes("application/xml", "text/xml")]
    public class UpnpEventsController : ControllerBase
    {
        [HttpNotify("[action]/{service?}")]
        public async Task<object> NotifyAsync(string deviceId, [FromHeader(Name = "SID")]string sid)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            Debug.WriteLine(xml.ToString());
            return Task.FromResult((object)new object[] { new { deviceId, sid }, "string1", "string2" });
        }

        [HttpNotify("notify/rc")]
        public async Task<object> NotifyRenderingControlAsync(string deviceId, [FromHeader(Name = "SID")]string sid)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            Debug.WriteLine(xml.ToString());
            return Task.FromResult((object)new object[] { new { deviceId, sid }, "string1", "string2" });
        }

        [HttpNotify("notify/avt")]
        public async Task<object> NotifyAVTransportAsync(string deviceId, [FromHeader(Name = "SID")]string sid)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            Debug.WriteLine(xml.ToString());
            return Task.FromResult((object)new object[] { new { deviceId, sid }, "string1", "string2" });
        }
    }
}