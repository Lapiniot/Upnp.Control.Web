using System.Diagnostics.CodeAnalysis;

namespace Web.Upnp.Control.Models;

[SuppressMessage("Performance", "CA1819: Properties should not return arrays")]
public record PushNotificationSubscription(Uri Endpoint, NotificationType Type, DateTimeOffset Created, byte[] P256dhKey, byte[] AuthKey);