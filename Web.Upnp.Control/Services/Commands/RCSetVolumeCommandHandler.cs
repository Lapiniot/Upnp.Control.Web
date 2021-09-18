using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public sealed class RCSetVolumeCommandHandler : IAsyncCommandHandler<RCSetVolumeCommand>
    {
        private readonly IUpnpServiceFactory factory;

        public RCSetVolumeCommandHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(RCSetVolumeCommand command, CancellationToken cancellationToken)
        {
            if(command is null) throw new ArgumentNullException(nameof(command));
            var (deviceId, volume) = command;
            var service = await factory.GetServiceAsync<RenderingControlService>(deviceId, cancellationToken).ConfigureAwait(false);
            await service.SetVolumeAsync(0, volume, cancellationToken).ConfigureAwait(false);
        }
    }
}