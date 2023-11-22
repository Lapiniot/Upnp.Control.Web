namespace Upnp.Control.Models.PushNotifications;

public record PSGetServerKeyQuery
{
    public static PSGetServerKeyQuery Instance { get; } = new();
}

public record struct PSEnumerateQuery(NotificationType Type);
public record struct PSGetQuery(Uri Endpoint);