namespace Upnp.Control.Models;

public abstract record NotificationMessage(string Type);

public sealed record AVStateMessage(DeviceDescription Device, AVState State, AVPosition Position, IReadOnlyDictionary<string, string> VendorProps) : NotificationMessage("av-state");

public sealed record RCStateMessage(DeviceDescription Device, RCVolumeState State) : NotificationMessage("rc-state");

public sealed record UpnpDiscoveryMessage(string Type, UpnpDevice Device) : NotificationMessage(Type);