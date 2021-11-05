using IoT.Protocol.Upnp;

namespace Upnp.Control.Infrastructure.UpnpDiscovery;

public interface IUpnpServiceMetadataProvider
{
    Task<UpnpDeviceDescription> GetDescriptionAsync(Uri location, CancellationToken cancellationToken);
}