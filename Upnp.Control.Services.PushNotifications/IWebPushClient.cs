namespace Upnp.Control.Services.PushNotifications;

public interface IWebPushClient
{
    public Task SendAsync(Uri endpoint, byte[] clientPublicKey, byte[] authKey, byte[] payload, int ttl, CancellationToken cancellationToken);
}