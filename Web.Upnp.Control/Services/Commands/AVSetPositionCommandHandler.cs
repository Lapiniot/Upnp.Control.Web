using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public class AVSetPositionCommandHandler : IAsyncCommandHandler<AVSetPositionCommand>
    {
        private readonly IUpnpServiceFactory factory;

        public AVSetPositionCommandHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(AVSetPositionCommand command, CancellationToken cancellationToken)
        {
            var (deviceId, (position, time)) = command;
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId).ConfigureAwait(false);

            if(position != null)
            {
                var info = await avt.GetPositionInfoAsync(0, cancellationToken).ConfigureAwait(false);
                if(info.TryGetValue("TrackDuration", out var value) && TimeSpan.TryParse(value, out var duration))
                {
                    var absTime = duration * position.Value;
                    await avt.SeekAsync(target: absTime.ToString("hh\\:mm\\:ss"), cancellationToken: cancellationToken).ConfigureAwait(false);
                }
                else
                {
                    throw new InvalidOperationException("Operation is not supported in the current state");
                }
            }
            else if(time != null)
            {
                await avt.SeekAsync(target: time.Value.ToString("hh\\:mm\\:ss"), cancellationToken: cancellationToken).ConfigureAwait(false);
            }
            else
            {
                throw new ArgumentException("Invalid position provided");
            }
        }
    }
}