namespace Upnp.Control.Models.Events;

public abstract record UpnpEvent
{
    public DeviceDescription Device { get; init; }
}

public record PropChangedEvent : UpnpEvent
{
    public IReadOnlyDictionary<string, string> Properties { get; init; }
    public IReadOnlyDictionary<string, string> VendorProperties { get; init; }
}

public record AVTPropChangedEvent : PropChangedEvent;

public record RCPropChangedEvent : PropChangedEvent;