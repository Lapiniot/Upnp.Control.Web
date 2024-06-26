using static System.Globalization.CultureInfo;

namespace Upnp.Control.Services.Commands;

internal sealed class AVSetPositionCommandHandler : IAsyncCommandHandler<AVSetPositionCommand>
{
    private readonly IUpnpServiceFactory factory;

    public AVSetPositionCommandHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task ExecuteAsync(AVSetPositionCommand command, CancellationToken cancellationToken)
    {
        var (deviceId, (position, time)) = command;
        var avt = await factory.GetServiceAsync<AVTransportService>(deviceId, cancellationToken).ConfigureAwait(false);

        if (position != null)
        {
            var info = await avt.GetPositionInfoAsync(0, cancellationToken).ConfigureAwait(false);
            if (info.TryGetValue("TrackDuration", out var value) && TimeSpan.TryParse(value, out var duration))
            {
                var absTime = (duration * position.Value).ToString("hh\\:mm\\:ss", InvariantCulture);

                try
                {
                    await avt.SeekAsync(0, "ABS_TIME", absTime, cancellationToken).ConfigureAwait(false);
                }
                catch (SoapException)
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
        else if (time != null)
        {
            await avt.SeekAsync(target: time.Value.ToString("hh\\:mm\\:ss", InvariantCulture), cancellationToken: cancellationToken).ConfigureAwait(false);
        }
        else
        {
            throw new ArgumentException("Invalid position provided");
        }
    }
}