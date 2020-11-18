using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services
{
    internal class UpnpServiceMetadataProvider : IUpnpServiceMetadataProvider
    {
        private readonly HttpClient client;

        public UpnpServiceMetadataProvider(HttpClient client)
        {
            this.client = client ?? throw new ArgumentNullException(nameof(client));
        }

        public async Task<UpnpDeviceDescription> GetDescriptionAsync(Uri location, CancellationToken cancellationToken)
        {
            using var response = await client.GetAsync(location, cancellationToken).ConfigureAwait(false);
            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
            return UpnpDeviceDescription.ParseXml(stream, location);
        }
    }
}