using System;
using System.Collections.Generic;
using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models
{
    public record GetDevicesQueryParams(string Category);

    public record GetDeviceQueryParams(string DeviceId);

    public record CDGetContentQueryParams(string DeviceId, string Path, GetContentOptions Options);

    public record GetContentOptions(bool? WithParents, bool? WithResourceProps, bool? WithVendorProps, uint Take = 50, uint Skip = 0);

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

    public record AVStateMessage(AVState State, AVPosition Position, IReadOnlyDictionary<string, string> VendorProps);

    public record RCVolumeState(uint? Volume, bool? Muted);

    public record AVStateParams(string State, string ObjectId, Uri CurrentUri);

    public record AVSetStateCommandParams(string DeviceId, AVStateParams State);

    public record AVGetStateQueryParams(string DeviceId, bool? Detailed);

    public record AVPositionParams(double? Position, TimeSpan? RelTime);

    public record AVSetPositionCommandParams(string DeviceId, AVPositionParams Position);

    public record AVGetPositionQueryParams(string DeviceId, bool? Detailed);

    public record AVGetPlayModeQueryParams(string DeviceId);

    public record AVSetPlayModeCommandParams(string DeviceId, string PlayMode);

    public record SysPropsGetPlaylistStateQueryParams(string DeviceId);

    public record RCGetVolumeQueryParams(string DeviceId, bool? Detailed);

    public record RCSetVolumeCommandParams(string DeviceId, uint Volume);

    public record RCGetMuteQueryParams(string DeviceId);

    public record RCSetMuteCommandParams(string DeviceId, bool Muted);

    public record CMGetProtocolInfoParams(string DeviceId);

    public record CMProtocolInfo(IEnumerable<string> Source, IEnumerable<string> Sink);

    public record CMGetConnectionsParams(string DeviceId);

    public record CMGetConnectionInfoParams(string DeviceId, string ConnectionId);

    public record CMConnectionInfo(string RcsID, string AVTransportID, string PeerConnectionID, string Direction, string Status);

    public record PLCreateParams(string DeviceId, string Title);

    public record PLUpdateParams(string DeviceId, string PlaylistId, string Title);

    public record PLRemoveParams(string DeviceId, IEnumerable<string> PlaylistIds);

    public record PLAddItemsParams(string DeviceId, string PlaylistId, string SourceDeviceId, IEnumerable<string> SourceItemIds);

    public record PLRemoveItemsParams(string DeviceId, string PlaylistId, IEnumerable<string> ItemIds);
}