using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models
{
    public record AVPositionInfo(string Track, string Duration, string RelTime)
    {
        public Item Current { get; init; }
    }
}