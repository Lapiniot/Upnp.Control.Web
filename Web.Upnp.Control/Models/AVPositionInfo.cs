using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models
{
    public class AVPositionInfo
    {
        public AVPositionInfo(string track, string duration, string relTime, string absTime, int? relCount, int? absCount)
        {
            Track = track;
            Duration = duration;
            RelTime = relTime;
            AbsTime = absTime;
            RelCount = relCount;
            AbsCount = absCount;
        }

        public Item Current { get; internal set; }
        public string Track { get; }
        public string Duration { get; }
        public string RelTime { get; }
        public string AbsTime { get; }
        public int? RelCount { get; }
        public int? AbsCount { get; }
    }
}