namespace Upnp.Control.Infrastructure.PushNotifications;

public sealed class WebPushClient(HttpClient client, [NotNull] IOptions<VAPIDSecretOptions> vapidOptions, [NotNull] IOptions<WebPushOptions> wpOptions) :
    System.Net.Http.WebPushClient(client, vapidOptions.Value.PublicKey, vapidOptions.Value.PrivateKey,
        wpOptions.Value.JwtSubject, wpOptions.Value.JwtExpiresSeconds), IWebPushClient
{ }