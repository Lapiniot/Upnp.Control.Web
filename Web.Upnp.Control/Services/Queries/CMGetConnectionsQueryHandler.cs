using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static System.StringSplitOptions;

namespace Web.Upnp.Control.Services.Queries
{
    public class CMGetConnectionsQueryHandler : IAsyncQueryHandler<CMGetConnectionsQuery, IEnumerable<string>>
    {
        private readonly IUpnpServiceFactory factory;

        public CMGetConnectionsQueryHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<IEnumerable<string>> ExecuteAsync(CMGetConnectionsQuery query, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<ConnectionManagerService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
            var result = await service.GetCurrentConnectionIDsAsync(cancellationToken).ConfigureAwait(false);
            return result["ConnectionIDs"].Split(',', RemoveEmptyEntries | TrimEntries);
        }
    }
}