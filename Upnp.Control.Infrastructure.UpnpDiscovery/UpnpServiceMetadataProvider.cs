using IoT.Protocol.Upnp;

namespace Upnp.Control.Infrastructure.UpnpDiscovery;

public class UpnpServiceMetadataProvider : IUpnpServiceMetadataProvider
{
    private readonly HttpClient client;

    public UpnpServiceMetadataProvider(HttpClient client)
    {
        ArgumentNullException.ThrowIfNull(client);

        this.client = client;
    }

    public async Task<UpnpDeviceDescription> GetDescriptionAsync(Uri location, CancellationToken cancellationToken)
    {
        using var response = await client.GetAsync(location, cancellationToken).ConfigureAwait(false);
        var stream = await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
        await using(stream.ConfigureAwait(false))
        {
            return UpnpDeviceDescription.ParseXml(stream, location);
        }
    }
}