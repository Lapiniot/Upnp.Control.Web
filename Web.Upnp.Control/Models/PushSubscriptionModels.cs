using System;

namespace Web.Upnp.Control.Models
{
    public record PushNotificationSubscription(Uri Endpoint, DateTimeOffset Created, DateTimeOffset? Expires, string P256dhKey, string AuthKey);
}