namespace Upnp.Control.Infrastructure.PushNotifications;

public interface IWebPushClient
{
    public Task SendAsync(Uri endpoint, byte[] clientKey, byte[] authKey, byte[] payload, int ttl, CancellationToken cancellationToken);
}