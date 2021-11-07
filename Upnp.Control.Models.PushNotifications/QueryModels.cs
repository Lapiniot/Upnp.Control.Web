namespace Upnp.Control.Models.PushNotifications;

public record PSGetServerKeyQuery()
{
    public static PSGetServerKeyQuery Instance { get; } = new PSGetServerKeyQuery();
}

public record PSEnumerateQuery(NotificationType Type);
public record PSGetQuery(NotificationType Type, Uri Endpoint);