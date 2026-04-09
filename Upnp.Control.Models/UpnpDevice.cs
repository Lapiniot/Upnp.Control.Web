namespace Upnp.Control.Models;

public sealed record UpnpDevice(string Udn, Uri Location, string DeviceType, string FriendlyName, string Manufacturer,
    string Description, string ModelName, string ModelNumber, DateTime ExpiresAt,
    Uri ManufacturerUri, Uri ModelUri, Uri PresentationUri)
{
    public string BootId { get; init; }
    public string ConfigId { get; init; }
    public IEnumerable<Icon> Icons { get; init; }
    public IEnumerable<Service> Services { get; init; }
}

public sealed record Service(string UniqueServiceName, string ServiceType, Uri MetadataUrl, Uri ControlUrl, Uri EventsUrl);

public sealed record Icon(int Width, int Height, Uri Url, string Mime);