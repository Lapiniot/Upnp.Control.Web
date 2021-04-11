using System;
using System.Diagnostics.CodeAnalysis;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;

namespace Web.Upnp.Control.Infrastructure.HttpClients
{
    [SuppressMessage("Microsoft.Design", "CA1812: Avoid uninstantiated internal classes", Justification = "Instantiated by infrastructure")]
    internal sealed class WebPushClient : System.Net.Http.WebPushClient, IWebPushClient
    {
        public WebPushClient(HttpClient client, IOptions<VAPIDSecretOptions> vapidOptions, IOptions<WebPushOptions> wpOptions) :
            base(client, WebEncoders.Base64UrlDecode(vapidOptions.Value.PublicKey), WebEncoders.Base64UrlDecode(vapidOptions.Value.PrivateKey),
            wpOptions.Value.JwtSubject, wpOptions.Value.JwtExpiresSeconds)
        {
        }
    }
    public interface IWebPushClient
    {
        public Task SendAsync(Uri endpoint, SubscriptionKeys keys, byte[] payload, int ttl, CancellationToken cancellationToken);
    }
}