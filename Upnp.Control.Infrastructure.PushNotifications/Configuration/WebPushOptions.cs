namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

public class WebPushOptions
{
    public string JwtSubject { get; set; } = "mailto:upnp.dashboard@gmail.com";
    public int JwtExpiresSeconds { get; set; } = 3600;
    public int TTLSeconds { get; set; } = 3600;
}