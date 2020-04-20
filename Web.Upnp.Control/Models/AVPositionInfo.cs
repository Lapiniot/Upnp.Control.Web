using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models
{
    public class AVPositionInfo
    {
        public AVPositionInfo(string track, string duration, string relTime, string absTime)
        {
            Track = track;
            Duration = duration;
            RelTime = relTime;
            AbsTime = absTime;
        }

        public Item Current { get; internal set; }
        public string Track { get; }
        public string Duration { get; }
        public string RelTime { get; }
        public string AbsTime { get; }
    }
}