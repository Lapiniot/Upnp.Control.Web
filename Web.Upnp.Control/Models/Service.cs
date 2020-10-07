using System;

namespace Web.Upnp.Control.Models
{
    public record Service(int Id, string ServiceId, string ServiceType, Uri MetadataUrl, Uri ControlUrl, Uri EventsUrl);
}