using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{

    public class PLRemoveCommand : PLCommandBase, IAsyncCommand<PLRemoveParams>
    {
        public PLRemoveCommand(IUpnpServiceFactory factory) : base(factory) {}

        public async Task ExecuteAsync(PLRemoveParams commandParameters, CancellationToken cancellationToken)
        {
            var (deviceId, ids) = commandParameters;

            var service = await Factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);

            var indices = await GetItemIndices(deviceId, "PL:", ids, cancellationToken).ConfigureAwait(false);

            var result = await service.DeleteAsync(indices: indices, cancellationToken: cancellationToken).ConfigureAwait(false);

            if(result["LengthChange"] == "0")
            {
                result = await service.DeleteAsync(updateId: result["NewUpdateID"], indices: indices, cancellationToken: cancellationToken).ConfigureAwait(false);
            }
        }
    }
}