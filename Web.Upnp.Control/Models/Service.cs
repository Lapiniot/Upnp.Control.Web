using System;

namespace Web.Upnp.Control.Models
{
    public record Service(string UniqueServiceName, string ServiceType, Uri MetadataUrl, Uri ControlUrl, Uri EventsUrl);
}