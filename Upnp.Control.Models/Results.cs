using IoT.Protocol.Upnp.DIDL;

namespace Upnp.Control.Models;

public sealed record DeviceDescription(string Udn, string Name, string Description);

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

public record struct CMProtocolInfo(IEnumerable<string> Source, IEnumerable<string> Sink);

public record struct CMConnectionInfo(string RcsID, string AVTransportID, string PeerConnectionID, string Direction, string Status);