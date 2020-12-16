using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class RCSetMuteCommandHandler : IAsyncCommandHandler<RCSetMuteCommand>
    {
        private readonly IUpnpServiceFactory factory;

        public RCSetMuteCommandHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(RCSetMuteCommand command, CancellationToken cancellationToken)
        {
            var (deviceId, mute) = command;
            var service = await factory.GetServiceAsync<RenderingControlService>(deviceId).ConfigureAwait(false);
            await service.SetMuteAsync(0, mute, cancellationToken).ConfigureAwait(false);
        }
    }
}