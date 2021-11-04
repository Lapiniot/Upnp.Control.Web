namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

public record WebPushOptions
{
    public string JwtSubject { get; init; } = "mailto:upnp.dashboard@gmail.com";
    public int JwtExpiresSeconds { get; init; } = 3600;
    public int TTLSeconds { get; init; } = 3600;
}