namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

public record VAPIDSecretOptions
{
    public string PublicKey { get; init; }
    public string PrivateKey { get; init; }
}