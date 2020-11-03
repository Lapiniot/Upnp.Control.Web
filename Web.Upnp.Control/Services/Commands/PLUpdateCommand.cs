using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLUpdateCommand : IAsyncCommand<PLUpdateParams>
    {
        private readonly IUpnpServiceFactory factory;

        public PLUpdateCommand(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(PLUpdateParams commandParameters, CancellationToken cancellationToken)
        {
            var (deviceId, playlistId, title) = commandParameters;
            var service = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var result = await service.RenameAsync(objectId: playlistId, title: title, cancellationToken: cancellationToken).ConfigureAwait(false);
            await service.RenameAsync(objectId: playlistId, title: title, updateId: result["NewUpdateID"], cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}