using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries
{
    public class CMGetConnectionInfoQuery : IAsyncQuery<CMGetConnectionInfoParams, CMConnectionInfo>
    {
        private readonly IUpnpServiceFactory factory;

        public CMGetConnectionInfoQuery(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new System.ArgumentNullException(nameof(factory));
        }

        public async Task<CMConnectionInfo> ExecuteAsync(CMGetConnectionInfoParams queryParameters, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<ConnectionManagerService>(queryParameters.DeviceId).ConfigureAwait(false);
            var r = await service.GetCurrentConnectionInfoAsync(queryParameters.ConnectionId, cancellationToken);
            return new CMConnectionInfo(r["RcsID"], r["AVTransportID"], r["PeerConnectionID"], r["Direction"], r["Status"]);
        }
    }
}