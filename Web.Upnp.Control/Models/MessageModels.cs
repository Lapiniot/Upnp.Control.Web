using Upnp.Control.Models;

namespace Web.Upnp.Control.Models;


public abstract record NotificationMessage(string Type);
public record AVStateMessage(AVState State, AVPosition Position, IReadOnlyDictionary<string, string> VendorProps) : NotificationMessage("av-state");
public record RCStateMessage(RCVolumeState State) : NotificationMessage("rc-state");
public record UpnpDiscoveryMessage(string Type, UpnpDevice Device) : NotificationMessage(Type);