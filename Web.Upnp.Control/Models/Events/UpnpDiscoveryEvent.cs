using System.Collections.Generic;

namespace Web.Upnp.Control.Models.Events
{
    public abstract record UpnpDiscoveryEvent(string DeviceId);
    public sealed record UpnpDeviceAppearedEvent(string DeviceId, ICollection<Service> Services) : UpnpDiscoveryEvent(DeviceId);
    public sealed record UpnpDeviceUpdatedEvent(string DeviceId, ICollection<Service> Services) : UpnpDiscoveryEvent(DeviceId);
    public sealed record UpnpDeviceDisappearedEvent(string DeviceId) : UpnpDiscoveryEvent(DeviceId);
}