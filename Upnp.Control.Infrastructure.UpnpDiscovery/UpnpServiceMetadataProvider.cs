using IoT.Protocol.Upnp.Metadata;
using DeviceDescription = IoT.Protocol.Upnp.Metadata.DeviceDescription;

namespace Upnp.Control.Infrastructure.UpnpDiscovery;

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
        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
        return await DeviceDescriptionReader.ReadAsync(stream, cancellationToken).ConfigureAwait(false);
    }
}