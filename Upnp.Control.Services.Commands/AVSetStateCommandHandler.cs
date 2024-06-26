using static IoT.Device.Upnp.Services.BrowseMode;

namespace Upnp.Control.Services.Commands;

internal sealed class AVSetStateCommandHandler : IAsyncCommandHandler<AVSetStateCommand>
{
    private readonly IUpnpServiceFactory factory;

    public AVSetStateCommandHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task ExecuteAsync(AVSetStateCommand command, CancellationToken cancellationToken)
    {
        var (deviceId, state) = command;
        var avt = await factory.GetServiceAsync<AVTransportService>(deviceId, cancellationToken).ConfigureAwait(false);

        switch (state.State)
        {
            case "playing":
                switch (state)
                {
                    case { ObjectId: { } objectId, SourceDevice: var source }:
                        await PlayItemAsync(deviceId, source, objectId, cancellationToken).ConfigureAwait(false);
                        break;
                    case { CurrentUri: { } uri }:
                        await PlayUriAsync(deviceId, uri, cancellationToken).ConfigureAwait(false);
                        break;
                    default:
                        await avt.PlayAsync(cancellationToken: cancellationToken).ConfigureAwait(false);
                        break;
                }

                break;
            case "stopped":
                await avt.StopAsync(cancellationToken: cancellationToken).ConfigureAwait(false);
                break;
            case "paused":
                await avt.PauseAsync(cancellationToken: cancellationToken).ConfigureAwait(false);
                break;
            case "playing-next":
                await avt.NextAsync(cancellationToken: cancellationToken).ConfigureAwait(false);
                break;
            case "playing-prev":
                await avt.PreviousAsync(cancellationToken: cancellationToken).ConfigureAwait(false);
                break;
            default:
                throw new NotSupportedException($"Unsupported state '{state.State}'");
        }
    }

    private async Task PlayItemAsync(string targetDevice, string sourceDevice, string id, CancellationToken cancellationToken)
    {
        var avt = await factory.GetServiceAsync<AVTransportService>(targetDevice, cancellationToken).ConfigureAwait(false);

        sourceDevice ??= targetDevice;

        if (!string.IsNullOrWhiteSpace(id))
        {
            var cd = await factory.GetServiceAsync<ContentDirectoryService>(sourceDevice, cancellationToken).ConfigureAwait(false);
            var result = await cd.BrowseAsync(id, mode: BrowseMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);
            var metadata = result["Result"];
            var item = DIDLXmlReader.Read(metadata, true, false).FirstOrDefault();
            if (item is not { Resource.Url: { } resUrl }) throw new InvalidOperationException();
            await avt.SetAVTransportUriAsync(0, resUrl, metadata, cancellationToken).ConfigureAwait(false);
        }

        await avt.PlayAsync(0, "1", cancellationToken).ConfigureAwait(false);
    }

    private async Task PlayUriAsync(string deviceId, Uri uri, CancellationToken cancellationToken)
    {
        var avt = await factory.GetServiceAsync<AVTransportService>(deviceId, cancellationToken).ConfigureAwait(false);
        await avt.SetAVTransportUriAsync(0, uri.AbsoluteUri, null, cancellationToken).ConfigureAwait(false);
        await avt.PlayAsync(0, "1", cancellationToken).ConfigureAwait(false);
    }
}