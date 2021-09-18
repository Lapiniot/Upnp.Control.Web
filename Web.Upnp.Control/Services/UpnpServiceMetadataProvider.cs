using IoT.Protocol.Upnp;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services
{
    public class UpnpServiceMetadataProvider : IUpnpServiceMetadataProvider
    {
        private readonly HttpClient client;

        public UpnpServiceMetadataProvider(HttpClient client)
        {
            this.client = client ?? throw new ArgumentNullException(nameof(client));
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
}