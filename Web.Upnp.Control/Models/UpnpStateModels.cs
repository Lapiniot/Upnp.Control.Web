using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models
{
    public record AVTransportState(string State, string Status, int? Tracks, string Medium, string PlayMode)
    {
        public Item CurrentTrackMetadata { get; init; }
        public Item NextTrackMetadata { get; init; }
        public string[] Actions { get; init; }
        public string CurrentTrack { get; init; }
        public string CurrentTrackUri { get; init; }
    }

    public record AVPositionInfo(string Track, string Duration, string RelTime)
    {
        public Item Current { get; init; }
    }

    public record RCVolumeState(uint? Volume, bool? Muted);
}