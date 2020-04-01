using System;
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
    [Consumes("application/xml", "text/xml")]
    public class UpnpEventsController : ControllerBase
    {
        private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> hub;

        public UpnpEventsController(IHubContext<UpnpEventsHub, IUpnpEventClient> hub)
        {
            this.hub = hub ?? throw new ArgumentNullException(nameof(hub));
        }

        [HttpNotify("[action]/{service?}")]
        public async Task NotifyAsync(string deviceId, [FromHeader(Name = "SID")] string sid)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            Debug.WriteLine(xml.ToString());
            var _ = hub.Clients.All.UpnpEvent(deviceId, sid);
        }

        [HttpNotify("notify/rc")]
        public async Task NotifyRenderingControlAsync(string deviceId, [FromHeader(Name = "SID")] string sid)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            Debug.WriteLine(xml.ToString());
            var _ = hub.Clients.All.UpnpEvent(deviceId, sid);
        }

        [HttpNotify("notify/avt")]
        public async Task NotifyAVTransportAsync(string deviceId, [FromHeader(Name = "SID")] string sid)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            Debug.WriteLine(xml.ToString());
            var _ = hub.Clients.All.UpnpEvent(deviceId, sid);
        }
    }
}