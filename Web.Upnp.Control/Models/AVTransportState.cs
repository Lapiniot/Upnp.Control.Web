using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models
{
    public class AVTransportState
    {
        internal AVTransportState(string state, string status, int? tracks, string medium)
        {
            State = state;
            Status = status;
            Tracks = tracks;
            Medium = medium;
        }

        public string[] Actions { get; internal set; }
        public Item Current { get; internal set; }
        public Item Next { get; internal set; }
        public string State { get; }
        public string Status { get; }
        public int? Tracks { get; }
        public string Medium { get; }
    }
}