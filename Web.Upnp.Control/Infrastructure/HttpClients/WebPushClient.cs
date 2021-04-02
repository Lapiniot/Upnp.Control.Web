using System.Net.Http;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;

namespace Web.Upnp.Control.Infrastructure.HttpClients
{
    public class WebPushClient
    {
        private readonly HttpClient client;
        private readonly string publicKey;
        private readonly string privateKey;

        public WebPushClient(HttpClient client, string publicKey, string privateKey)
        {
            if(string.IsNullOrWhiteSpace(publicKey))
            {
                throw new System.ArgumentException($"'{nameof(publicKey)}' cannot be null or whitespace.", nameof(publicKey));
            }

            if(string.IsNullOrWhiteSpace(privateKey))
            {
                throw new System.ArgumentException($"'{nameof(privateKey)}' cannot be null or whitespace.", nameof(privateKey));
            }

            this.publicKey = publicKey;
            this.privateKey = privateKey;
        }

        public WebPushClient(HttpClient client, IOptions<VAPIDSecretOptions> options)
        {
            if(client is null) throw new System.ArgumentNullException(nameof(client));
            if(options is null) throw new System.ArgumentNullException(nameof(options));

            publicKey = options.Value.PublicKey;
            privateKey = options.Value.PrivateKey;
        }
    }
}