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
}