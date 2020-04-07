using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using IoT.Protocol.Upnp;
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
        private readonly IHubContext<UpnpEventsHub, IUpnpEventClient> hub;
        private readonly XmlReaderSettings settings = new XmlReaderSettings {Async = true, IgnoreComments = true, IgnoreWhitespace = true};

        public UpnpEventsController(IHubContext<UpnpEventsHub, IUpnpEventClient> hub)
        {
            this.hub = hub ?? throw new ArgumentNullException(nameof(hub));
        }

        [HttpNotify("[action]/{service}")]
        public Task NotifyAsync(string deviceId, string service)
        {
            var _ = hub.Clients.All.UpnpEvent(deviceId, service, new object());
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
            IDictionary<string, string> map;

            using(var reader = XmlReader.Create(HttpContext.Request.Body, settings))
            {
                map = await EventMessageParser.ParseAsync(reader).ConfigureAwait(false);
            }

            if(map == null || map.Count == 0) return;

            var current = map.TryGetValue("CurrentTrackMetaData", out var value) ? DIDLParser.Parse(value, false).FirstOrDefault() : null;
            var next = map.TryGetValue("NextTrackMetaData", out value) ? DIDLParser.Parse(value, false).FirstOrDefault() : null;

            var state = new AVTransportState(map.TryGetValue("TransportState", out value) ? value : null, null,
                map.TryGetValue("NumberOfTracks", out value) && int.TryParse(value, out var tracks) ? tracks : default(int?), null)
            {
                Actions = map.TryGetValue("CurrentTransportActions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null,
                Current = current,
                Next = next
            };

            var track = map.TryGetValue("CurrentTrack", out value) ? value : null;
            var duration = map.TryGetValue("CurrentTrackDuration", out value) ? value : null;
            var relTime = map.TryGetValue("RelativeTimePosition", out value) ? value : null;
            var position = new AVPositionInfo(track, duration, relTime, null, null, null);

            var _ = hub.Clients.All.AVTransportEvent(deviceId, new {state, position});
        }
    }
}