using System.Text;

namespace Upnp.Control.Services.Commands;

internal sealed class PLCreateFromItemsCommandHandler : PLCommandBase, IAsyncCommandHandler<PLCreateFromItemsCommand>
{
    private readonly IOptionsSnapshot<PlaylistOptions> options;

    public PLCreateFromItemsCommandHandler(IUpnpServiceFactory serviceFactory, IOptionsSnapshot<PlaylistOptions> options) :
        base(serviceFactory)
    {
        ArgumentNullException.ThrowIfNull(options);

        this.options = options;
    }

    public async Task ExecuteAsync(PLCreateFromItemsCommand command, CancellationToken cancellationToken)
    {
        var (deviceId, (title, (sourceDeviceId, ids, depth))) = command;
        var maxDepth = depth ?? options.Value.MaxContainerScanDepth;

        var sb = new StringBuilder();
        using (var writer = DIDLUtils.CreateDidlXmlWriter(sb))
        {
            await WriteItemsMetadataTreeAsync(sourceDeviceId, ids, writer, maxDepth, cancellationToken).ConfigureAwait(false);
        }

        await CreatePlaylistAsync(deviceId, title, sb.ToString(), cancellationToken).ConfigureAwait(false);
    }
}