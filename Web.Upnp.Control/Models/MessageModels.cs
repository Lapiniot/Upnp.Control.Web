using System.Collections.Generic;

namespace Web.Upnp.Control.Models
{
    public record AVStateMessage(AVState State, AVPosition Position, IReadOnlyDictionary<string, string> VendorProps);
    public record RCStateMessage(RCVolumeState State);
    public record UpnpDiscoveryMessage(string Type, UpnpDevice Device);
}