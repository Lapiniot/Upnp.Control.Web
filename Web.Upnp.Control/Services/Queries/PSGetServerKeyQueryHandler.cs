using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries
{
    public class PSGetServerKeyQueryHandler : IAsyncQueryHandler<PSGetServerKeyQuery, byte[]>
    {
        private readonly IOptions<VAPIDSecretOptions> options;

        public PSGetServerKeyQueryHandler(IOptions<VAPIDSecretOptions> options)
        {
            this.options = options ?? throw new ArgumentNullException(nameof(options));
        }

        public Task<byte[]> ExecuteAsync(PSGetServerKeyQuery query, CancellationToken cancellationToken)
        {
            return Task.FromResult(WebEncoders.Base64UrlDecode(options.Value.PublicKey));
        }
    }
}