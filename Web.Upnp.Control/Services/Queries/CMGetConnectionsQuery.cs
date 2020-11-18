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
    public class CMGetConnectionsQuery : IAsyncQuery<CMGetConnectionsParams, IEnumerable<string>>
    {
        private readonly IUpnpServiceFactory factory;

        public CMGetConnectionsQuery(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<IEnumerable<string>> ExecuteAsync(CMGetConnectionsParams queryParameters, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<ConnectionManagerService>(queryParameters.DeviceId).ConfigureAwait(false);
            var result = await service.GetCurrentConnectionIDsAsync(cancellationToken).ConfigureAwait(false);
            return result["ConnectionIDs"].Split(',', RemoveEmptyEntries | TrimEntries);
        }
    }
}