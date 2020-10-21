using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class AVSetPlayModeCommand : IAsyncCommand<AVSetPlayModeCommandParams>
    {
        private readonly IUpnpServiceFactory factory;

        public AVSetPlayModeCommand(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new System.ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(AVSetPlayModeCommandParams commandParameters, CancellationToken cancellationToken)
        {
            var avt = await factory.GetServiceAsync<AVTransportService>(commandParameters.DeviceId).ConfigureAwait(false);
            await avt.SetPlayModeAsync(0, commandParameters.PlayMode, cancellationToken).ConfigureAwait(false);
        }
    }
}