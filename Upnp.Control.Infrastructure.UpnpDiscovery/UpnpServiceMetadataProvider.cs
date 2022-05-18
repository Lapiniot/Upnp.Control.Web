using System.Diagnostics.CodeAnalysis;
using IoT.Protocol.Upnp.Metadata;

namespace Upnp.Control.Infrastructure.UpnpDiscovery;

[SuppressMessage("Performance", "CA1812: Avoid uninstantiated internal classes", Justification = "Instantiated by DI container")]
internal sealed class UpnpServiceMetadataProvider : IUpnpServiceMetadataProvider
{
    private readonly HttpClient client;

    public UpnpServiceMetadataProvider(HttpClient client)
    {
        ArgumentNullException.ThrowIfNull(client);

        this.client = client;
    }

    public async Task<DeviceDescription> GetDescriptionAsync(Uri location, CancellationToken cancellationToken)
    {
        using var response = await client.GetAsync(location, cancellationToken).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();
        using var stream = await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
        return await DeviceDescriptionReader.ReadAsync(stream, cancellationToken).ConfigureAwait(false);
    }
}