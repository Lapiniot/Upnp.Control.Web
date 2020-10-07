using System;
using System.Collections.Generic;

namespace Web.Upnp.Control.Models
{
    public record Device(string Udn, Uri Location, string DeviceType, string FriendlyName, string Manufacturer,
        string Description, string ModelName, string ModelNumber, DateTime ExpiresAt)
    {
        public ICollection<Icon> Icons { get; init; }
        public ICollection<Service> Services { get; init; }
    };
}