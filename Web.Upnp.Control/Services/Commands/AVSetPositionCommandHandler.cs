using System;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Soap;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static System.Globalization.CultureInfo;

namespace Web.Upnp.Control.Services.Commands
{
    public sealed class AVSetPositionCommandHandler : IAsyncCommandHandler<AVSetPositionCommand>
    {
        private readonly IUpnpServiceFactory factory;

        public AVSetPositionCommandHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task ExecuteAsync(AVSetPositionCommand command, CancellationToken cancellationToken)
        {
            if(command is null) throw new ArgumentNullException(nameof(command));

            var (deviceId, (position, time)) = command;
            var avt = await factory.GetServiceAsync<AVTransportService>(deviceId, cancellationToken).ConfigureAwait(false);

            if(position != null)
            {
                var info = await avt.GetPositionInfoAsync(0, cancellationToken).ConfigureAwait(false);
                if(info.TryGetValue("TrackDuration", out var value) && TimeSpan.TryParse(value, out var duration))
                {
                    var absTime = (duration * position.Value).ToString("hh\\:mm\\:ss", InvariantCulture);

                    try
                    {
                        await avt.SeekAsync(0, "ABS_TIME", absTime, cancellationToken).ConfigureAwait(false);
                    }
                    catch(SoapException)
                    {
                        // try REL_TIME value for seekMode as a fallback if target renderer device doesn't support "ABS_TIME"
                        await avt.SeekAsync(0, "REL_TIME", absTime, cancellationToken).ConfigureAwait(false);
                    }
                }
                else
                {
                    throw new InvalidOperationException("Operation is not supported in the current state");
                }
            }
            else if(time != null)
            {
                await avt.SeekAsync(target: time.Value.ToString("hh\\:mm\\:ss", InvariantCulture), cancellationToken: cancellationToken).ConfigureAwait(false);
            }
            else
            {
                throw new ArgumentException("Invalid position provided");
            }
        }
    }
}