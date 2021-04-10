using System;
using System.Net.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;

namespace Web.Upnp.Control.Infrastructure.HttpClients
{
    public class WebPushClient : System.Net.Http.WebPushClient
    {
        public WebPushClient(HttpClient client, IOptions<VAPIDSecretOptions> options) : base(client,
            WebEncoders.Base64UrlDecode((options?.Value ?? throw new ArgumentNullException(nameof(options))).PublicKey),
            WebEncoders.Base64UrlDecode(options.Value.PrivateKey))
        {
        }
    }
}