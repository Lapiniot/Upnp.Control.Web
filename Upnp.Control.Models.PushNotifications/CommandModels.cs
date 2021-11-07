using System.Diagnostics.CodeAnalysis;

namespace Upnp.Control.Models.PushNotifications;

[SuppressMessage("Performance", "CA1819: Properties should not return arrays")]
public record PSAddCommand(NotificationType Type, Uri Endpoint, byte[] P256dhKey, byte[] AuthKey);

public record PSRemoveCommand(NotificationType Type, Uri Endpoint);