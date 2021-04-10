using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries
{
    public sealed class CMGetConnectionInfoQueryHandler : IAsyncQueryHandler<CMGetConnectionInfoQuery, CMConnectionInfo>
    {
        private readonly IUpnpServiceFactory factory;

        public CMGetConnectionInfoQueryHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<CMConnectionInfo> ExecuteAsync(CMGetConnectionInfoQuery query, CancellationToken cancellationToken)
        {
            if(query is null) throw new ArgumentNullException(nameof(query));
            var service = await factory.GetServiceAsync<ConnectionManagerService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
            var r = await service.GetCurrentConnectionInfoAsync(query.ConnectionId, cancellationToken).ConfigureAwait(false);
            return new CMConnectionInfo(r["RcsID"], r["AVTransportID"], r["PeerConnectionID"], r["Direction"], r["Status"]);
        }
    }
}