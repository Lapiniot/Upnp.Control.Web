using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp;

namespace Web.Upnp.Control.Services.Abstractions
{
    public interface IUpnpServiceMetadataProvider
    {
        Task<UpnpDeviceDescription> GetDescriptionAsync(Uri location, CancellationToken cancellationToken);
    }
}