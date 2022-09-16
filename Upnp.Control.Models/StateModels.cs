using IoT.Protocol.Upnp.DIDL;

namespace Upnp.Control.Models;

public sealed record DeviceDescription(string Udn, string Name, string Description);

public record struct GetContentOptions(bool WithParents = true, bool WithResourceProps = false, bool WithVendorProps = false,
    bool WithMetadata = false, bool WithDevice = true, uint Take = 50, uint Skip = 0);

public sealed record CDContent(int Total, DeviceDescription Device, Item Metadata, IEnumerable<Item> Items, IEnumerable<Item> Parents);

public sealed record AVState(string State, string Status, int? Tracks, string Medium, string PlayMode)
{
    public Item Current { get; init; }
    public Item Next { get; init; }
    public IEnumerable<string> Actions { get; init; }
    public string CurrentTrack { get; init; }
    public Uri CurrentTrackUri { get; init; }
}

public record struct AVPosition(string CurrentTrack, string Duration, string RelTime)
{
    public Item Current { get; init; }
}

public record struct RCVolumeState(uint? Volume, bool? Muted);

public record struct AVStateParams(string State, string ObjectId, string SourceDevice, Uri CurrentUri);

public record struct AVPositionParams(double? Position, TimeSpan? RelTime);

public record struct CMProtocolInfo(IEnumerable<string> Source, IEnumerable<string> Sink);

public record struct CMConnectionInfo(string RcsID, string AVTransportID, string PeerConnectionID, string Direction, string Status);

public record struct CreatePlaylistParams(string Title, MediaSourceParams Source);

public record struct MediaSourceParams(string DeviceId, IEnumerable<string> Items, int? MaxDepth);

public record struct FeedUrlSourceParams(Uri Url, string Title, bool UseProxy);