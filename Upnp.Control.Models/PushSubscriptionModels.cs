using System.Diagnostics.CodeAnalysis;

namespace Upnp.Control.Models;

public enum NotificationType
{
    DeviceDiscovery,
    PlaybackStateChange,
    ContentUpdated
}

[SuppressMessage("Performance", "CA1819: Properties should not return arrays")]
public record PushNotificationSubscription(Uri Endpoint, NotificationType Type, DateTimeOffset Created, byte[] P256dhKey, byte[] AuthKey);