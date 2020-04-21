using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models
{
    public class AVPositionInfo
    {
        public AVPositionInfo(string track, string duration, string relTime)
        {
            Track = track;
            Duration = duration;
            RelTime = relTime;
        }

        [JsonConverter(typeof(ItemJsonConverter))]
        public Item Current { get; internal set; }

        public string Track { get; }
        public string Duration { get; }
        public string RelTime { get; }
    }
}