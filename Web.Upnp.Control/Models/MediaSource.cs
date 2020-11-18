using System.Collections.Generic;

namespace Web.Upnp.Control.Models
{
    public record MediaSource(string DeviceId, IEnumerable<string> Items);
}