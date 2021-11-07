namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

#pragma warning disable CA1819 // Properties should not return arrays

public class VAPIDSecretOptions
{
    public byte[] PublicKey { get; set; }
    public byte[] PrivateKey { get; set; }
}