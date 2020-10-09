using IoT.Protocol.Upnp;

namespace Web.Upnp.Control.Models.Events
{
    public abstract record UpnpDiscoveryEvent(string DeviceId);
    public sealed record UpnpDeviceAppearedEvent(string DeviceId, UpnpDeviceDescription Description) : UpnpDiscoveryEvent(DeviceId);
    public sealed record UpnpDeviceDisappearedEvent(string DeviceId) : UpnpDiscoveryEvent(DeviceId);
}