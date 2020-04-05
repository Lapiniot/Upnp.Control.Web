using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
using IoT.Protocol.Upnp.DIDL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Web.Upnp.Control.Hubs;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/events/{deviceId}")]
    [Consumes("application/xml", "text/xml")]
    public class UpnpEventsController : ControllerBase
    {
        private readonly XNamespace NS = "urn:schemas-upnp-org:event-1-0";

        private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> hub;

        public UpnpEventsController(IHubContext<UpnpEventsHub, IUpnpEventClient> hub)
        {
            this.hub = hub ?? throw new ArgumentNullException(nameof(hub));
        }

        [HttpNotify("[action]/{service}")]
        public Task NotifyAsync(string deviceId, string service)
        {
            var _ = hub.Clients.All.UpnpEvent(deviceId, service, new object { });
            return Task.CompletedTask;
        }

        [HttpNotify("notify/rc")]
        public async Task NotifyRenderingControlAsync(string deviceId, [FromHeader(Name = "SID")] string sid)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            Debug.WriteLine(xml.ToString());
            var _ = hub.Clients.All.RenderingControlEvent(deviceId, sid);
        }

        [HttpNotify("notify/avt")]
        public async Task NotifyAVTransportAsync(string deviceId)
        {
            var xml = await XElement.LoadAsync(HttpContext.Request.Body, LoadOptions.None, default).ConfigureAwait(false);
            var innerXml = xml.Element(NS + "property").Elements().First().Value;
            var map = XElement.Parse(innerXml).Elements().First().Elements().ToDictionary(
                i => i.Name.LocalName, i => i.Attribute("val")?.Value ?? i.Value);

            var state = new AVTransportState(map.TryGetValue("TransportState", out var value) ? value : null, null,
                map.TryGetValue("NumberOfTracks", out value) && int.TryParse(value, out var tracks) ? tracks : default(int?), null)
            {
                Actions = map.TryGetValue("CurrentTransportActions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null,
                Current = map.TryGetValue("CurrentTrackMetaData", out value) ? DIDLParser.Parse(value).FirstOrDefault() : null,
                Next = map.TryGetValue("NextTrackMetaData", out value) ? DIDLParser.Parse(value).FirstOrDefault() : null
            };

            var position = new AVPositionInfo(
                map.TryGetValue("CurrentTrack", out value) ? value : null,
                map.TryGetValue("CurrentTrackDuration", out value) ? value : null,
                map.TryGetValue("RelativeTimePosition", out value) ? value : null,
                null, null, null);

            var _ = hub.Clients.All.AVTransportEvent(deviceId, new { state, position });
        }
    }
}