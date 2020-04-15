using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860
/*
 * http-get:*:audio/dsd:*,
 * http-get:*:audio/wav:*,
 * http-get:*:audio/wave:*,
 * http-get:*:audio/x-wav:*,
 * http-get:*:audio/x-aiff:*,
 * http-get:*:audio/mpeg:*,
 * http-get:*:audio/mpegurl:*,
 * http-get:*:audio/x-mpeg:*,
 * http-get:*:audio/mp1:*,
 * http-get:*:audio/aac:*,
 * http-get:*:audio/flac:*,
 * http-get:*:audio/x-flac:*,
 * http-get:*:audio/m4a:*,
 * http-get:*:audio/mp4:*,
 * http-get:*:audio/x-m4a:*,
 * http-get:*:audio/vorbis:*,
 * http-get:*:audio/ogg:*,
 * http-get:*:audio/x-ogg:*,
 * http-get:*:audio/x-scpls:*
 */

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
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
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
                return new AVTransportState(transport.TryGetValue("CurrentTransportState", out var value) ? value : null,
                    transport.TryGetValue("CurrentTransportStatus", out value) ? value : null,
                    media.TryGetValue("NrTracks", out value) && int.TryParse(value, out var numTracks) ? numTracks : 0,
                    media.TryGetValue("PlayMedium", out value) ? value : null)
                {
                    Actions = actions.TryGetValue("Actions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null,
                    CurrentTrackMetadata = detailed != false && media.TryGetValue("CurrentURIMetaData", out value) ? DIDLParser.ParseLoose(value).FirstOrDefault() : null,
                    NextTrackMetadata = detailed != false && media.TryGetValue("NextURIMetaData", out value) ? DIDLParser.ParseLoose(value).FirstOrDefault() : null
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

        [HttpGet("playlist_state")]
        [HttpGet("playlist_state()")]
        [Produces("application/json")]
        public async Task GetPlaylistStateAsync(string deviceId)
        {
            var sp = await factory.GetServiceAsync<SystemPropertiesService>(deviceId).ConfigureAwait(false);
            var value = await sp.GetStringAsync("fastCall?command=state_playlists").ConfigureAwait(false);
            var lv = await sp.GetStringAsync("UpdateState").ConfigureAwait(false);
            await HttpContext.Response.BodyWriter.WriteAsync(Encoding.UTF8.GetBytes(value)).ConfigureAwait(false);
            await HttpContext.Response.BodyWriter.CompleteAsync(null).ConfigureAwait(false);
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

        [HttpGet("play")]
        [HttpGet("play()")]
        [Produces("application/json")]
        public async Task PlayAsync(string deviceId)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.PlayAsync().ConfigureAwait(false);
        }

        [HttpGet("play/{id}")]
        [HttpGet("play({id})")]
        [Produces("application/json")]
        public async Task PlayItemAsync(string deviceId, [FromRoute] [FromQuery] string id)
        {
            var cd = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            var result = await cd.BrowseAsync(id, flags: "BrowseMetadata").ConfigureAwait(false);
            var item = DIDLParser.Parse(result["Result"]).FirstOrDefault();
            if(item is { Resource: { Url: { } resUrl } })
            {
                var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
                await avt.SetAVTransportUriAsync(currentUri: resUrl).ConfigureAwait(false);
                await avt.PlayAsync().ConfigureAwait(false);
            }
        }

        [HttpGet("play_uri/{uri?}")]
        [HttpGet("play_uri({uri})")]
        [Produces("application/json")]
        public async Task PlayUriAsync(string deviceId, [FromRoute] [FromQuery] string uri)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.SetAVTransportUriAsync(currentUri: uri).ConfigureAwait(false);
            await avt.PlayAsync().ConfigureAwait(false);
        }

        [HttpGet("pause")]
        [HttpGet("pause()")]
        [Produces("application/json")]
        public async Task PauseAsync(string deviceId)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.PauseAsync().ConfigureAwait(false);
        }

        [HttpGet("stop")]
        [HttpGet("stop()")]
        [Produces("application/json")]
        public async Task StopAsync(string deviceId)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.StopAsync().ConfigureAwait(false);
        }

        [HttpGet("prev")]
        [HttpGet("prev()")]
        [Produces("application/json")]
        public async Task PrevAsync(string deviceId)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.PreviousAsync().ConfigureAwait(false);
        }

        [HttpGet("next")]
        [HttpGet("next()")]
        [Produces("application/json")]
        public async Task NextAsync(string deviceId)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.NextAsync().ConfigureAwait(false);
        }
    }
}