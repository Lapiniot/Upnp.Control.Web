using System.Net.Http.Jwt;

namespace Upnp.Control.Infrastructure.PushNotifications;

internal sealed class WebPushClient(HttpClient client, IJwtTokenHandler jwtTokenHandler,
    [NotNull] IOptions<VAPIDSecretOptions> vapidOptions, [NotNull] IOptions<WebPushOptions> wpOptions) :
    System.Net.Http.WebPush.WebPushClient(client, vapidOptions.Value.PublicKey,
        jwtTokenHandler, wpOptions.Value.JwtSubject, wpOptions.Value.JwtExpiresSeconds),
    IWebPushClient
{ }