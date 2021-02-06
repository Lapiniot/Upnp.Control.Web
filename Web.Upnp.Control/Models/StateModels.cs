using System;
using System.Collections.Generic;
using IoT.Protocol.Upnp.DIDL;
using Microsoft.AspNetCore.Http;

namespace Web.Upnp.Control.Models
{
    public record GetDevicesQuery(string Category);

    public record GetDeviceQuery(string DeviceId);

    public record CDGetContentQuery(string DeviceId, string Path, GetContentOptions Options);

    public record GetContentOptions(bool? WithParents, bool? WithResourceProps, bool? WithVendorProps, uint Take = 50, uint Skip = 0);

    public record ContentResult(int Total, IEnumerable<Item> Items, IEnumerable<Item> Parents);

    public record AVState(string State, string Status, int? Tracks, string Medium, string PlayMode)
    {
        public Item Current { get; init; }
        public Item Next { get; init; }
        public string[] Actions { get; init; }
        public string CurrentTrack { get; init; }
        public string CurrentTrackUri { get; init; }
    }

    public record AVPosition(string CurrentTrack, string Duration, string RelTime)
    {
        public Item Current { get; init; }
    }

    public record AVStateMessage(AVState State, AVPosition Position, IReadOnlyDictionary<string, string> VendorProps);

    public record RCVolumeState(uint? Volume, bool? Muted);

    public record AVStateParams(string State, string ObjectId, string SourceDevice, Uri CurrentUri);

    public record AVSetStateCommand(string DeviceId, AVStateParams State);

    public record AVGetStateQuery(string DeviceId, bool? Detailed);

    public record AVPositionParams(double? Position, TimeSpan? RelTime);

    public record AVSetPositionCommand(string DeviceId, AVPositionParams Position);

    public record AVGetPositionQuery(string DeviceId, bool? Detailed);

    public record AVGetPlayModeQuery(string DeviceId);

    public record AVSetPlayModeCommand(string DeviceId, string PlayMode);

    public record SysPropsGetPlaylistStateQuery(string DeviceId);

    public record RCGetVolumeQuery(string DeviceId, bool? Detailed);

    public record RCSetVolumeCommand(string DeviceId, uint Volume);

    public record RCGetMuteQuery(string DeviceId);

    public record RCSetMuteCommand(string DeviceId, bool Muted);

    public record CMGetProtocolInfoQuery(string DeviceId);

    public record CMProtocolInfo(IEnumerable<string> Source, IEnumerable<string> Sink);

    public record CMGetConnectionsQuery(string DeviceId);

    public record CMGetConnectionInfoQuery(string DeviceId, string ConnectionId);

    public record CMConnectionInfo(string RcsID, string AVTransportID, string PeerConnectionID, string Direction, string Status);

    public record PLCreateCommand(string DeviceId, string Title);

    public record CreatePlaylistParams(string Title, MediaSource Source, int? maxDepth);

    public record PLCreateFromItemsCommand(string DeviceId, CreatePlaylistParams Params);

    public record PLCreateFromFilesCommand(string DeviceId, PlaylistFilesSource Source, string Title, bool? Merge);

    public record PLUpdateCommand(string DeviceId, string PlaylistId, string Title);

    public record PLRemoveCommand(string DeviceId, IEnumerable<string> PlaylistIds);

    public record PLAddItemsCommand(string DeviceId, string PlaylistId, MediaSource Source);

    public record PLAddFeedUrlCommand(string DeviceId, string PlaylistId, FeedUrlSource Source);

    public record PLAddPlaylistFilesCommand(string DeviceId, string PlaylistId, PlaylistFilesSource Source);

    public record PLRemoveItemsCommand(string DeviceId, string PlaylistId, IEnumerable<string> ItemIds);

    public record QAddItemsCommand(string DeviceId, string QueueId, MediaSource Source);

    public record QClearCommand(string DeviceId, string QueueId);

    public record MediaSource(string DeviceId, IEnumerable<string> Items);

    public record PlaylistFilesSource(IEnumerable<IFormFile> Files, bool? UseProxy);

    public record FeedUrlSource(Uri Url, string Title, bool? UseProxy);
}