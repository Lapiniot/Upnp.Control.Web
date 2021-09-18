using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;

namespace Web.Upnp.Control.Infrastructure.HttpClients
{
    public sealed class WebPushClient : System.Net.Http.WebPushClient, IWebPushClient
    {
        public WebPushClient(HttpClient client, IOptions<VAPIDSecretOptions> vapidOptions, IOptions<WebPushOptions> wpOptions) :
            base(client, WebEncoders.Base64UrlDecode((vapidOptions ?? throw new ArgumentNullException(nameof(vapidOptions))).Value.PublicKey),
                WebEncoders.Base64UrlDecode(vapidOptions.Value.PrivateKey),
                (wpOptions ?? throw new ArgumentNullException(nameof(wpOptions))).Value.JwtSubject, wpOptions.Value.JwtExpiresSeconds)
        {
        }
    }
    public interface IWebPushClient
    {
        public Task SendAsync(Uri endpoint, SubscriptionKeys keys, byte[] payload, int ttl, CancellationToken cancellationToken);
    }
}