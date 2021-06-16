using System;
using System.Collections.Generic;

namespace Web.Upnp.Control.Models
{
    public record UpnpDevice(string Udn, Uri Location, string DeviceType, string FriendlyName, string Manufacturer,
        string Description, string ModelName, string ModelNumber, DateTime ExpiresAt,
        Uri ManufacturerUri, Uri ModelUri, Uri PresentationUri)
    {
        public string BootId { get; init; }
        public string ConfigId { get; init; }
        public IEnumerable<Icon> Icons { get; init; }
        public IEnumerable<Service> Services { get; init; }
    }

    public record Service(string UniqueServiceName, string ServiceType, Uri MetadataUrl, Uri ControlUrl, Uri EventsUrl);

    public record Icon(int Width, int Height, Uri Url, string Mime);
}