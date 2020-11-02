using System;
using System.Collections.Generic;
using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models
{
    public record GetDevicesQueryParams(string Category);

    public record GetDeviceQueryParams(string DeviceId);

    public record GetContentQueryParams(string DeviceId, string Path, GetContentOptions Options);

    public record GetContentOptions(bool? WithParents, uint Take = 50, uint Skip = 0);

    public record GetContentResult(int Total, IEnumerable<Item> Items, IEnumerable<Item> Parents);

    public record AVState(string State, string Status, int? Tracks, string Medium, string PlayMode)
    {
        public Item CurrentTrackMetadata { get; init; }
        public Item NextTrackMetadata { get; init; }
        public string[] Actions { get; init; }
        public string CurrentTrack { get; init; }
        public string CurrentTrackUri { get; init; }
    }

    public record AVPosition(string Track, string Duration, string RelTime)
    {
        public Item Current { get; init; }
    }

    public record RCVolumeState(uint? Volume, bool? Muted);

    public record AVStateParams(string State, string ObjectId, Uri CurrentUri);

    public record AVSetStateCommandParams(string DeviceId, AVStateParams State);

    public record AVGetStateQueryParams(string DeviceId, bool? Detailed);

    public record AVPositionParams(double? Position, TimeSpan? RelTime);

    public record AVSetPositionCommandParams(string DeviceId, AVPositionParams Position);

    public record AVGetPositionQueryParams(string DeviceId, bool? detailed);

    public record AVGetPlayModeQueryParams(string DeviceId);

    public record AVSetPlayModeCommandParams(string DeviceId, string PlayMode);

    public record SysPropsGetPlaylistStateQueryParams(string DeviceId);

    public record RCGetVolumeQueryParams(string DeviceId, bool? detailed);

    public record RCSetVolumeCommandParams(string DeviceId, uint volume);

    public record RCGetMuteQueryParams(string DeviceId);

    public record RCSetMuteCommandParams(string DeviceId, bool muted);

    public record CMGetProtocolInfoParams(string DeviceId);

    public record CMProtocolInfo(IEnumerable<string> Source, IEnumerable<string> Sink);

    public record CMGetConnectionsParams(string DeviceId);

    public record CMGetConnectionInfoParams(string DeviceId, string ConnectionId);

    public record CMConnectionInfo(string RcsID, string AVTransportID, string PeerConnectionID, string Direction, string Status);
}