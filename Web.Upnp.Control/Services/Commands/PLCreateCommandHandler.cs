using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLCreateCommandHandler : IAsyncCommandHandler<PLCreateCommand>
    {
        private readonly IUpnpServiceFactory factory;

        public PLCreateCommandHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(PLCreateCommand command, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<PlaylistService>(command.DeviceId, cancellationToken).ConfigureAwait(false);
            await service.CreateAsync(title: command.Title, cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}