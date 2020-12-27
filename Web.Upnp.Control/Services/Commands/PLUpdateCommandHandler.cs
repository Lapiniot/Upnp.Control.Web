using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLUpdateCommandHandler : IAsyncCommandHandler<PLUpdateCommand>
    {
        private readonly IUpnpServiceFactory factory;

        public PLUpdateCommandHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(PLUpdateCommand command, CancellationToken cancellationToken)
        {
            var (deviceId, playlistId, title) = command;
            var service = await factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var result = await service.RenameAsync(objectId: playlistId, title: title, cancellationToken: cancellationToken).ConfigureAwait(false);
            await service.RenameAsync(objectId: playlistId, title: title, updateId: result["NewUpdateID"], cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}