using System.Diagnostics.CodeAnalysis;
using Upnp.Control.Infrastructure.PushNotifications.Configuration;

namespace Upnp.Control.Infrastructure.PushNotifications;

public sealed class WebPushClient : System.Net.Http.WebPushClient, IWebPushClient
{
    public WebPushClient(HttpClient client, [NotNull] IOptions<VAPIDSecretOptions> vapidOptions, [NotNull] IOptions<WebPushOptions> wpOptions) :
        base(client, vapidOptions.Value.PublicKey, vapidOptions.Value.PrivateKey, wpOptions.Value.JwtSubject, wpOptions.Value.JwtExpiresSeconds)
    { }
}