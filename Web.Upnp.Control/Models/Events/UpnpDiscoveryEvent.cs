namespace Web.Upnp.Control.Models.Events
{
    public abstract record UpnpDiscoveryEvent(string DeviceId);

    public sealed record UpnpDeviceAppearedEvent(string DeviceId, Device Device) : UpnpDiscoveryEvent(DeviceId);

    public sealed record UpnpDeviceUpdatedEvent(string DeviceId, Device Device) : UpnpDiscoveryEvent(DeviceId);

    public sealed record UpnpDeviceDisappearedEvent(string DeviceId, Device Device) : UpnpDiscoveryEvent(DeviceId);
}