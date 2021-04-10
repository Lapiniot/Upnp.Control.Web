namespace Web.Upnp.Control.Models.Events
{
    public abstract record UpnpDiscoveryEvent(string DeviceId);

#pragma warning disable CA1801 // Review unused parameters

    public sealed record UpnpDeviceAppearedEvent(string DeviceId, UpnpDevice Device) : UpnpDiscoveryEvent(DeviceId);

    public sealed record UpnpDeviceUpdatedEvent(string DeviceId, UpnpDevice Device) : UpnpDiscoveryEvent(DeviceId);

    public sealed record UpnpDeviceDisappearedEvent(string DeviceId, UpnpDevice Device) : UpnpDiscoveryEvent(DeviceId);

#pragma warning restore CA1801 // Review unused parameters
}