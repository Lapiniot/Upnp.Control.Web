using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static System.StringSplitOptions;

namespace Web.Upnp.Control.Services.Queries
{
    public sealed class CMGetProtocolInfoQueryHandler : IAsyncQueryHandler<CMGetProtocolInfoQuery, CMProtocolInfo>
    {
        private readonly IUpnpServiceFactory factory;

        public CMGetProtocolInfoQueryHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<CMProtocolInfo> ExecuteAsync(CMGetProtocolInfoQuery query, CancellationToken cancellationToken)
        {
            if(query is null) throw new ArgumentNullException(nameof(query));
            var service = await factory.GetServiceAsync<ConnectionManagerService>(query.DeviceId, cancellationToken).ConfigureAwait(false);
            var result = await service.GetProtocolInfoAsync(cancellationToken).ConfigureAwait(false);
            return new CMProtocolInfo(
                result.TryGetValue("Source", out var value) ? value.Split(',', TrimEntries | RemoveEmptyEntries) : null,
                result.TryGetValue("Sink", out value) ? value.Split(',', TrimEntries | RemoveEmptyEntries) : null);
        }
    }
}