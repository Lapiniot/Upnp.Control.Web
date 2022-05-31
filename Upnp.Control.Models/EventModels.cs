namespace Upnp.Control.Models;

#region SSDP Discovery events

public abstract record UpnpDiscoveryEvent(string DeviceId);

public sealed record UpnpDeviceAppearedEvent(string DeviceId, UpnpDevice Device) : UpnpDiscoveryEvent(DeviceId);

public sealed record UpnpDeviceUpdatedEvent(string DeviceId, UpnpDevice Device) : UpnpDiscoveryEvent(DeviceId);

public sealed record UpnpDeviceDisappearedEvent(string DeviceId, UpnpDevice Device) : UpnpDiscoveryEvent(DeviceId);

#endregion

#region UPnP events

public abstract record UpnpEvent
{
    public DeviceDescription Device { get; init; }
}

public abstract record PropChangedEvent : UpnpEvent
{
    public IReadOnlyDictionary<string, string> Properties { get; init; }
    public IReadOnlyDictionary<string, string> VendorProperties { get; init; }
}

public sealed record AVTPropChangedEvent : PropChangedEvent;

public sealed record RCPropChangedEvent : PropChangedEvent;

#endregion