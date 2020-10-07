using System;
using System.Collections.Generic;

namespace Web.Upnp.Control.Models
{
    public record Device(string Udn, Uri Location, string DeviceType, string FriendlyName, string Manufacturer,
        string Description, string ModelName, string ModelNumber, DateTimeOffset? ExpiresAt)
    {
        public ICollection<Icon> Icons { get; set; }
        public ICollection<Service> Services { get; set; }
    };
}