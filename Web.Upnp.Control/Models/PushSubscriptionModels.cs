using System;

namespace Web.Upnp.Control.Models
{
    public record PushNotificationSubscription(Uri Endpoint, DateTimeOffset Created, DateTimeOffset? Expires, byte[] P256dhKey, byte[] AuthKey);
}