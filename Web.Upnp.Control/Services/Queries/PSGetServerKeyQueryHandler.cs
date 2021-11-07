using Microsoft.Extensions.Options;
using Upnp.Control.Infrastructure.PushNotifications.Configuration;
using Upnp.Control.Models.PushNotifications;
using Upnp.Control.Services;

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
        return Task.FromResult(options.Value.PublicKey);
    }
}