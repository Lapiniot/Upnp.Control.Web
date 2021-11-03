using Upnp.Control.Models;

namespace Web.Upnp.Control.Models.Events;

public abstract record UpnpDiscoveryEvent(string DeviceId);

public sealed record UpnpDeviceAppearedEvent(string DeviceId, UpnpDevice Device) : UpnpDiscoveryEvent(DeviceId);

public sealed record UpnpDeviceUpdatedEvent(string DeviceId, UpnpDevice Device) : UpnpDiscoveryEvent(DeviceId);

public sealed record UpnpDeviceDisappearedEvent(string DeviceId, UpnpDevice Device) : UpnpDiscoveryEvent(DeviceId);