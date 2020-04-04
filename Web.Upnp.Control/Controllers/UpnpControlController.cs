using System;
using System.Linq;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/[controller]({deviceId})")]
    [Route("api/[controller]/{deviceId}")]
    public class UpnpControlController : ControllerBase
    {
        private readonly IUpnpServiceFactory factory;

        public UpnpControlController(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new System.ArgumentNullException(nameof(factory));
        }

        [HttpGet("state")]
        [HttpGet("state()")]
        [Produces("application/json")]
        public async Task<AVTransportState> GetStateAsync(string deviceId, [FromQuery] bool? detailed = false)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            var actions = await avt.GetCurrentTransportActionsAsync(0, HttpContext.RequestAborted).ConfigureAwait(false);
            var transport = await avt.GetTransportInfoAsync(0, HttpContext.RequestAborted).ConfigureAwait(false);
            if(detailed != false)
            {
                var media = await avt.GetMediaInfoAsync(0, HttpContext.RequestAborted).ConfigureAwait(false);
                //var positionInfo = await avt.GetPositionInfoAsync(0, HttpContext.RequestAborted).ConfigureAwait(false);
                return new AVTransportState(transport.TryGetValue("CurrentTransportState", out var value) ? value : null,
                    transport.TryGetValue("CurrentTransportStatus", out value) ? value : null,
                    media.TryGetValue("NrTracks", out value) && int.TryParse(value, out var numTracks) ? numTracks : 0,
                    media.TryGetValue("PlayMedium", out value) ? value : null)
                {
                    Actions = actions.TryGetValue("Actions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null,
                    Current = detailed != false && media.TryGetValue("CurrentURIMetaData", out value) ? DIDLParser.Parse(value).FirstOrDefault() : null,
                    Next = detailed != false && media.TryGetValue("NextURIMetaData", out value) ? DIDLParser.Parse(value).FirstOrDefault() : null
                };
            }
            else
            {
                return new AVTransportState(transport.TryGetValue("CurrentTransportState", out var value) ? value : null,
                    transport.TryGetValue("CurrentTransportStatus", out value) ? value : null, null, null)
                {
                    Actions = actions.TryGetValue("Actions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null
                };
            }
        }

        [HttpGet("position")]
        [HttpGet("position()")]
        [Produces("application/json")]
        public async Task<AVPositionInfo> GetPositionAsync(string deviceId, bool? detailed = false)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            var info = await avt.GetPositionInfoAsync(0, HttpContext.RequestAborted).ConfigureAwait(false);
            return new AVPositionInfo(
                info.TryGetValue("Track", out var value) ? value : null,
                info.TryGetValue("TrackDuration", out value) ? value : null,
                info.TryGetValue("RelTime", out value) ? value : null,
                info.TryGetValue("AbsTime", out value) ? value : null,
                info.TryGetValue("RelCount", out value) && int.TryParse(value, out var time) ? time : default(int?),
                info.TryGetValue("AbsCount", out value) && int.TryParse(value, out time) ? time : default(int?))
            {
                Current = detailed != false && info.TryGetValue("TrackMetaData", out value) ? DIDLParser.Parse(value).FirstOrDefault() : null
            };
        }
    }
}