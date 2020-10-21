using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class RCSetMuteCommand : IAsyncCommand<RCSetMuteCommandParams>
    {
        private readonly IUpnpServiceFactory factory;

        public RCSetMuteCommand(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(RCSetMuteCommandParams commandParameters, CancellationToken cancellationToken)
        {
            var (deviceId, mute) = commandParameters;
            var service = await factory.GetServiceAsync<RenderingControlService>(deviceId).ConfigureAwait(false);
            await service.SetMuteAsync(0, mute, cancellationToken).ConfigureAwait(false);
        }
    }
}