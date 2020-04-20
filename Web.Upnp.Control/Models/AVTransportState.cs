using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models
{
    public class AVTransportState
    {
        internal AVTransportState(string state, string status, int? tracks, string medium, string playMode)
        {
            State = state;
            Status = status;
            Tracks = tracks;
            Medium = medium;
            PlayMode = playMode;
        }

        public string[] Actions { get; internal set; }
        public Item CurrentTrackMetadata { get; internal set; }
        public Item NextTrackMetadata { get; internal set; }
        public string State { get; }
        public string Status { get; }
        public int? Tracks { get; }
        public string Medium { get; }
        public string PlayMode { get; }
        public string CurrentTrack { get; internal set; }
        public string CurrentTrackUri { get; internal set; }
    }
}