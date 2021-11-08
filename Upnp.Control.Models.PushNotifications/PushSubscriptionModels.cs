using System.Diagnostics.CodeAnalysis;

namespace Upnp.Control.Models.PushNotifications;

[Flags]
public enum NotificationType
{
    None,
    DeviceDiscovery = 0x1,
    PlaybackStateChange = 0x2,
    ContentUpdated = 0x4
}

[SuppressMessage("Performance", "CA1819: Properties should not return arrays")]
public record PushNotificationSubscription(Uri Endpoint, NotificationType Type, DateTimeOffset Created, byte[] P256dhKey, byte[] AuthKey);