using IoT.Protocol.Upnp;

namespace Upnp.Control.Infrastructure.UpnpDiscovery;

public interface IUpnpServiceMetadataProvider
{
    Task<DeviceDescription> GetDescriptionAsync(Uri location, CancellationToken cancellationToken);
}