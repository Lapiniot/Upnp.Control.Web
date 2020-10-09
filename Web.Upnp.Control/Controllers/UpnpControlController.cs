using System;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Routing;
using Web.Upnp.Control.Services.Abstractions;
using static IoT.Protocol.Upnp.Services.BrowseMode;

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
        public async Task<AVTransportState> GetStateAsync(string deviceId, CancellationToken cancellationToken, [FromQuery] bool? detailed = false)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            var actions = await avt.GetCurrentTransportActionsAsync(0, cancellationToken).ConfigureAwait(false);
            var transport = await avt.GetTransportInfoAsync(0, cancellationToken).ConfigureAwait(false);

            if(detailed != false)
            {
                var media = await avt.GetMediaInfoAsync(0, cancellationToken).ConfigureAwait(false);
                var settings = await avt.GetTransportSettingsAsync(0, cancellationToken).ConfigureAwait(false);
                return new AVTransportState(transport.TryGetValue("CurrentTransportState", out var value) ? value : null,
                    transport.TryGetValue("CurrentTransportStatus", out value) ? value : null,
                    media.TryGetValue("NrTracks", out value) && int.TryParse(value, out var numTracks) ? numTracks : 0,
                    media.TryGetValue("PlayMedium", out value) ? value : null,
                    settings.TryGetValue("PlayMode", out value) ? value : null)
                {
                    Actions = actions.TryGetValue("Actions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null,
                    CurrentTrackMetadata = detailed != false && media.TryGetValue("CurrentURIMetaData", out value) ? DIDLXmlParser.ParseLoose(value).FirstOrDefault() : null,
                    NextTrackMetadata = detailed != false && media.TryGetValue("NextURIMetaData", out value) ? DIDLXmlParser.ParseLoose(value).FirstOrDefault() : null
                };
            }
            else
            {
                return new AVTransportState(transport.TryGetValue("CurrentTransportState", out var value) ? value : null,
                    transport.TryGetValue("CurrentTransportStatus", out value) ? value : null, null, null, null)
                {
                    Actions = actions.TryGetValue("Actions", out value) ? value.Split(',', StringSplitOptions.RemoveEmptyEntries) : null
                };
            }
        }

        [HttpGet("playlist_state")]
        [HttpGet("playlist_state()")]
        [Produces("application/json")]
        public async Task GetPlaylistStateAsync(string deviceId, CancellationToken cancellationToken)
        {
            var sps = await factory.GetServiceAsync<SystemPropertiesService>(deviceId).ConfigureAwait(false);
            var value = await sps.GetStringAsync("fastCall?command=state_playlists", cancellationToken).ConfigureAwait(false);
            await HttpContext.Response.BodyWriter.WriteAsync(Encoding.UTF8.GetBytes(value), cancellationToken).ConfigureAwait(false);
            await HttpContext.Response.BodyWriter.CompleteAsync().ConfigureAwait(false);
        }

        [HttpGet("position")]
        [HttpGet("position()")]
        [Produces("application/json")]
        public async Task<AVPositionInfo> GetPositionAsync(string deviceId, CancellationToken cancellationToken, bool? detailed = false)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            var info = await avt.GetPositionInfoAsync(0, cancellationToken).ConfigureAwait(false);
            return new AVPositionInfo(info.TryGetValue("Track", out var value) ? value : null, info.TryGetValue("TrackDuration", out value) ? value : null,
                info.TryGetValue("RelTime", out value) ? value : null)
            {
                Current = detailed != false && info.TryGetValue("TrackMetaData", out value) ? DIDLXmlParser.Parse(value).FirstOrDefault() : null
            };
        }

        [HttpPut("position")]
        [HttpPut("position()")]
        [Consumes("application/json")]
        public async Task SeekAsync(string deviceId, [FromBody] double position, CancellationToken cancellationToken)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            var info = await avt.GetPositionInfoAsync(0, cancellationToken).ConfigureAwait(false);
            if(info.TryGetValue("TrackDuration", out var value) && TimeSpan.TryParse(value, out var duration))
            {
                var absTime = duration * position;
                await avt.SeekAsync(target: absTime.ToString("hh\\:mm\\:ss")).ConfigureAwait(false);
            }
            else
            {
                throw new InvalidOperationException("Operation is not supported in the current state");
            }
        }

        [HttpGet("seek/{time:timespan}")]
        [HttpGet("seek({time:timespan})")]
        public async Task SeekAsync(string deviceId, TimeSpan time, CancellationToken cancellationToken)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.SeekAsync(target: time.ToString("hh\\:mm\\:ss")).ConfigureAwait(false);
        }

        [HttpGet("play()")]
        [HttpGet("play/{*id}")]
        public async Task PlayItemAsync(string deviceId, [FromRouteOrQuery] string id, CancellationToken cancellationToken)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);

            if(!string.IsNullOrWhiteSpace(id))
            {
                var cd = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
                var result = await cd.BrowseAsync(id, mode: BrowseMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);
                var item = DIDLXmlParser.Parse(result["Result"]).FirstOrDefault();
                if(!(item is { Resource: { Url: { } resUrl } })) throw new InvalidOperationException();
                await avt.SetAVTransportUriAsync(currentUri: resUrl, cancellationToken: cancellationToken).ConfigureAwait(false);
            }

            await avt.PlayAsync(0, "1", cancellationToken).ConfigureAwait(false);
        }

        [HttpGet("play_uri/{*uri}")]
        [HttpGet("play_uri()")]
        public async Task PlayUriAsync(string deviceId, [FromRouteOrQuery] string uri, CancellationToken cancellationToken)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.SetAVTransportUriAsync(0, uri, null, cancellationToken).ConfigureAwait(false);
            await avt.PlayAsync(0, "1", cancellationToken).ConfigureAwait(false);
        }

        [HttpGet("pause")]
        [HttpGet("pause()")]
        public async Task PauseAsync(string deviceId, CancellationToken cancellationToken)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.PauseAsync(0, cancellationToken).ConfigureAwait(false);
        }

        [HttpGet("stop")]
        [HttpGet("stop()")]
        public async Task StopAsync(string deviceId, CancellationToken cancellationToken)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.StopAsync(0, cancellationToken).ConfigureAwait(false);
        }

        [HttpGet("prev")]
        [HttpGet("prev()")]
        public async Task PrevAsync(string deviceId, CancellationToken cancellationToken)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.PreviousAsync(0, cancellationToken).ConfigureAwait(false);
        }

        [HttpGet("next")]
        [HttpGet("next()")]
        public async Task NextAsync(string deviceId, CancellationToken cancellationToken)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.NextAsync(0, cancellationToken).ConfigureAwait(false);
        }

        [HttpPut("play_mode")]
        [HttpPut("play_mode()")]
        [Consumes("application/json")]
        public async Task SetPlayModeAsync(string deviceId, [FromBody] string mode, CancellationToken cancellationToken)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);
            await avt.SetPlayModeAsync(0, mode, cancellationToken).ConfigureAwait(false);
        }

        [HttpGet("volume")]
        [HttpGet("volume()")]
        public async Task<object> GetVolumeAsync(string deviceId, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<RenderingControlService>(deviceId).ConfigureAwait(false);
            var rv = await service.GetVolumeAsync(0, cancellationToken);
            var rm = await service.GetMuteAsync(0, cancellationToken);

            return new
            {
                Volume = rv.TryGetValue("CurrentVolume", out var v) && int.TryParse(v, out var vol) ? vol : 0,
                Muted = rv.TryGetValue("CurrentMute", out v) && bool.TryParse(v, out var muted) ? muted : false,
            };
        }

        [HttpPut("volume")]
        [HttpPut("volume()")]
        public async Task SetVolumeAsync(string deviceId, [FromBody] uint volume, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<RenderingControlService>(deviceId).ConfigureAwait(false);
            await service.SetVolumeAsync(0, volume, cancellationToken);
        }

        [HttpPut("mute")]
        [HttpPut("mute()")]
        public async Task SetMuteAsync(string deviceId, [FromBody] bool mute, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<RenderingControlService>(deviceId).ConfigureAwait(false);
            await service.SetMuteAsync(0, mute, cancellationToken);
        }
    }
}