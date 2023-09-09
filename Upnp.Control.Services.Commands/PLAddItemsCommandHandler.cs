using System.Text;

namespace Upnp.Control.Services.Commands;

internal sealed class PLAddItemsCommandHandler : PLCommandBase, IAsyncCommandHandler<PLAddItemsCommand>
{
    private readonly IOptionsSnapshot<PlaylistOptions> options;

    public PLAddItemsCommandHandler(IUpnpServiceFactory factory, IOptionsSnapshot<PlaylistOptions> options) : base(factory)
    {
        ArgumentNullException.ThrowIfNull(options);

        this.options = options;
    }

    public Task ExecuteAsync(PLAddItemsCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);
        ArgumentNullException.ThrowIfNull(command.Source);
        ArgumentNullException.ThrowIfNull(command.Source.Items);
        ArgumentException.ThrowIfNullOrEmpty(command.DeviceId);
        ArgumentException.ThrowIfNullOrEmpty(command.PlaylistId);
        ArgumentException.ThrowIfNullOrEmpty(command.Source.DeviceId);

        var (deviceId, playlistId, (sourceDeviceId, items, maxDepth)) = command;

        return AddItemsAsync(deviceId, playlistId, sourceDeviceId, items, maxDepth, cancellationToken);
    }

    private async Task AddItemsAsync(string deviceId, string playlistId, string sourceDeviceId, IEnumerable<string> items, int? maxDepth, CancellationToken cancellationToken)
    {
        var depth = maxDepth ?? options.Value.MaxContainerScanDepth;

        var sb = new StringBuilder();
        using (var writer = DIDLUtils.CreateDidlXmlWriter(sb))
        {
            await WriteItemsMetadataTreeAsync(sourceDeviceId, items, writer, depth, cancellationToken).ConfigureAwait(false);
        }

        await AddItemAsync(deviceId, playlistId, sb.ToString(), cancellationToken).ConfigureAwait(false);
    }
}