namespace Upnp.Control.Models.Events;

public abstract record UpnpEvent
{
    public string DeviceId { get; init; }
}

public record PropChangedUpnpEvent : UpnpEvent
{
    public IReadOnlyDictionary<string, string> Properties { get; init; }
    public IReadOnlyDictionary<string, string> VendorProperties { get; init; }
}

public record AVTPropChangedEvent : PropChangedUpnpEvent { }

public record RCPropChangedEvent : PropChangedUpnpEvent { }