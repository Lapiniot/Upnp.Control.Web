using Upnp.Control.Abstractions;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.Infrastructure.PushNotifications;

public class PSGetServerKeyQueryHandler : IAsyncQueryHandler<PSGetServerKeyQuery, byte[]>
{
    private readonly IOptions<VAPIDSecretOptions> options;

    public PSGetServerKeyQueryHandler(IOptions<VAPIDSecretOptions> options)
    {
        ArgumentNullException.ThrowIfNull(options);
        this.options = options;
    }

    public Task<byte[]> ExecuteAsync(PSGetServerKeyQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(options.Value.PublicKey);
}