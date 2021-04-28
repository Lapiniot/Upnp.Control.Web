using System;
using System.Collections.Generic;
using IoT.Protocol.Upnp.DIDL;
using Microsoft.AspNetCore.Http;

namespace Web.Upnp.Control.Models
{

#pragma warning disable CA1801 // Review unused parameters, looks like issue with analyzer itself
    public record DeviceDescription(string Name, string Description);
    public record GetContentOptions(bool? WithParents, bool? WithResourceProps, bool? WithVendorProps, bool? WithMetadata, bool? WithDevice, uint Take = 50, uint Skip = 0);
    public record CDContent(int Total, DeviceDescription Device, Item Metadata, IEnumerable<Item> Items, IEnumerable<Item> Parents);

    public record AVState(string State, string Status, int? Tracks, string Medium, string PlayMode)
    {
        public Item Current { get; init; }
        public Item Next { get; init; }
        public IEnumerable<string> Actions { get; init; }
        public string CurrentTrack { get; init; }
        public Uri CurrentTrackUri { get; init; }
    }

    public record AVPosition(string CurrentTrack, string Duration, string RelTime)
    {
        public Item Current { get; init; }
    }

    public record RCVolumeState(uint? Volume, bool? Muted);
    public record AVStateParams(string State, string ObjectId, string SourceDevice, Uri CurrentUri);
    public record AVPositionParams(double? Position, TimeSpan? RelTime);
    public record CMProtocolInfo(IEnumerable<string> Source, IEnumerable<string> Sink);
    public record CMConnectionInfo(string RcsID, string AVTransportID, string PeerConnectionID, string Direction, string Status);
    public record CreatePlaylistParams(string Title, MediaSource Source);
    public record MediaSource(string DeviceId, IEnumerable<string> Items, int? MaxDepth);
    public record PlaylistFilesSource(IEnumerable<IFormFile> Files, bool? UseProxy);
    public record FeedUrlSource(Uri Url, string Title, bool? UseProxy);
    public record PushSubscription(Uri Endpoint, long? Expiration, string P256dhKey, string AuthKey);

#pragma warning restore CA1801 // Review unused parameters
}