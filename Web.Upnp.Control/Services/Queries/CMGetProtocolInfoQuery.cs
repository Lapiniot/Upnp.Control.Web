using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static System.StringSplitOptions;

namespace Web.Upnp.Control.Services.Queries
{
    public class CMGetProtocolInfoQuery : IAsyncQuery<CMGetProtocolInfoParams, CMProtocolInfo>
    {
        private readonly IUpnpServiceFactory factory;

        public CMGetProtocolInfoQuery(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<CMProtocolInfo> ExecuteAsync(CMGetProtocolInfoParams queryParameters, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<ConnectionManagerService>(queryParameters.DeviceId).ConfigureAwait(false);
            var result = await service.GetProtocolInfoAsync(cancellationToken).ConfigureAwait(false);
            return new CMProtocolInfo(
                result.TryGetValue("Source", out var value) ? value.Split(',', TrimEntries | RemoveEmptyEntries) : null,
                result.TryGetValue("Sink", out value) ? value.Split(',', TrimEntries | RemoveEmptyEntries) : null);
        }
    }
}