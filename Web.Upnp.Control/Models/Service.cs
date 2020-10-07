using System;

namespace Web.Upnp.Control.Models
{
    public record Service(string ServiceId, string ServiceType, Uri MetadataUrl, Uri ControlUrl, Uri EventsUrl)
    {
        private int id;
    }
}