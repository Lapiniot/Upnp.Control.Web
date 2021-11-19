using System.Text;
using static System.Globalization.CultureInfo;

namespace Upnp.Control.Services.Commands;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class PLAddItemsCommandHandler : PLCommandBase, IAsyncCommandHandler<PLAddItemsCommand>
{
    private readonly IOptionsSnapshot<Configuration.PlaylistOptions> options;

    public PLAddItemsCommandHandler(IUpnpServiceFactory factory, IOptionsSnapshot<Configuration.PlaylistOptions> options) : base(factory)
    {
        ArgumentNullException.ThrowIfNull(options);

        this.options = options;
    }

    public Task ExecuteAsync(PLAddItemsCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        return command switch
        {
            { DeviceId: null or "" } => throw new ArgumentException(string.Format(InvariantCulture, MissingArgumentErrorFormat, nameof(PLAddItemsCommand.DeviceId))),
            { PlaylistId: null or "" } => throw new ArgumentException(string.Format(InvariantCulture, MissingArgumentErrorFormat, nameof(PLAddItemsCommand.PlaylistId))),
            { Source: { DeviceId: { } source, Items: { } ids, MaxDepth: var depth }, DeviceId: var deviceId, PlaylistId: var playlistId } =>
                AddItemsAsync(deviceId, playlistId, source, ids, depth, cancellationToken),
            _ => throw new ArgumentException("Valid source deviceId and item ids must be provided")
        };
    }

    private async Task AddItemsAsync(string deviceId, string playlistId, string sourceDeviceId, IEnumerable<string> items, int? maxDepth, CancellationToken cancellationToken)
    {
        var depth = maxDepth ?? options.Value.MaxContainerScanDepth;

        var sb = new StringBuilder();

        using(var writer = DIDLUtils.CreateDidlXmlWriter(sb))
        {
            await WriteItemsMetadataTreeAsync(sourceDeviceId, items, writer, depth, cancellationToken).ConfigureAwait(false);
        }

        await AddItemAsync(deviceId, playlistId, sb.ToString(), cancellationToken).ConfigureAwait(false);
    }
}