using Microsoft.Extensions.Options;
using Upnp.Control.Infrastructure.PushNotifications.Configuration;

namespace Upnp.Control.Infrastructure.PushNotifications;

public sealed class WebPushClient : System.Net.Http.WebPushClient, IWebPushClient
{
    public WebPushClient(HttpClient client, IOptions<VAPIDSecretOptions> vapidOptions, IOptions<WebPushOptions> wpOptions) :
        base(client, Encoders.FromBase64String((vapidOptions ?? throw new ArgumentNullException(nameof(vapidOptions))).Value.PublicKey),
            Encoders.FromBase64String(vapidOptions.Value.PrivateKey),
            (wpOptions ?? throw new ArgumentNullException(nameof(wpOptions))).Value.JwtSubject, wpOptions.Value.JwtExpiresSeconds)
    { }
}