using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLCreateCommand : IAsyncCommand<PLCreateParams>
    {
        private readonly IUpnpServiceFactory factory;

        public PLCreateCommand(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(PLCreateParams commandParameters, CancellationToken cancellationToken)
        {
            var service = await factory.GetServiceAsync<PlaylistService>(commandParameters.DeviceId).ConfigureAwait(false);
            await service.CreateAsync(title: commandParameters.Title, cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}