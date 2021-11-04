using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Upnp.Control.Infrastructure.PushNotifications.Configuration;
using Upnp.Control.Services;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.Services.Queries;

public class PSGetServerKeyQueryHandler : IAsyncQueryHandler<PSGetServerKeyQuery, byte[]>
{
    private readonly IOptions<VAPIDSecretOptions> options;

    public PSGetServerKeyQueryHandler(IOptions<VAPIDSecretOptions> options)
    {
        ArgumentNullException.ThrowIfNull(options);
        this.options = options;
    }

    public Task<byte[]> ExecuteAsync(PSGetServerKeyQuery query, CancellationToken cancellationToken)
    {
        return Task.FromResult(WebEncoders.Base64UrlDecode(options.Value.PublicKey));
    }
}