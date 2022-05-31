using DeviceDescription = IoT.Protocol.Upnp.Metadata.DeviceDescription;

namespace Upnp.Control.Infrastructure.UpnpDiscovery;

public interface IUpnpServiceMetadataProvider
{
    Task<DeviceDescription> GetDescriptionAsync(Uri location, CancellationToken cancellationToken);
}