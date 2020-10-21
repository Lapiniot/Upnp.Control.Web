using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class RCSetVolumeCommand : IAsyncCommand<RCSetVolumeCommandParams>
    {
        private readonly IUpnpServiceFactory factory;

        public RCSetVolumeCommand(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(RCSetVolumeCommandParams commandParameters, CancellationToken cancellationToken)
        {
            var (deviceId, volume) = commandParameters;
            var service = await factory.GetServiceAsync<RenderingControlService>(deviceId).ConfigureAwait(false);
            await service.SetVolumeAsync(0, volume, cancellationToken).ConfigureAwait(false);
        }
    }
}