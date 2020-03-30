using System.Diagnostics;
using System.Threading.Tasks;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Web.Upnp.Control.Hubs;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/events/{deviceId}")]
    [Produces("application/json")]
    [Consumes("application/xml", "text/xml")]
    public class UpnpEventsController : ControllerBase
    {
        private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> hub;

        public UpnpEventsController(IHubContext<UpnpEventsHub, IUpnpEventClient> hub)
        {
            this.hub = hub ?? throw new System.ArgumentNullException(nameof(hub));
        }

        [HttpNotify("[action]/{service?}")]
        public async Task<object> NotifyAsync(string deviceId, [FromHeader(Name = "SID")] string sid)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            Debug.WriteLine(xml.ToString());
            return Task.FromResult((object)new object[] { new { deviceId, sid }, "string1", "string2" });
        }

        [HttpNotify("notify/rc")]
        public async Task<object> NotifyRenderingControlAsync(string deviceId, [FromHeader(Name = "SID")] string sid)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            Debug.WriteLine(xml.ToString());
            await hub.Clients.All.UpnpEvent(deviceId, sid);
            return Task.FromResult((object)new object[] { new { deviceId, sid }, "string1", "string2" });
        }

        [HttpNotify("notify/avt")]
        public async Task<object> NotifyAVTransportAsync(string deviceId, [FromHeader(Name = "SID")] string sid)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            Debug.WriteLine(xml.ToString());
            await hub.Clients.All.UpnpEvent(deviceId, sid);
            return Task.FromResult((object)new object[] { new { deviceId, sid }, "string1", "string2" });
        }
    }
}