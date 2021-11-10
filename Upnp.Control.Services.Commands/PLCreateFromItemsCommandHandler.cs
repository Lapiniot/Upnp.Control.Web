using System.Text;

namespace Upnp.Control.Services.Commands;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
internal sealed class PLCreateFromItemsCommandHandler : PLCommandBase, IAsyncCommandHandler<PLCreateFromItemsCommand>
{
    private readonly IOptionsSnapshot<Configuration.PlaylistOptions> options;

    public PLCreateFromItemsCommandHandler(IUpnpServiceFactory serviceFactory, IOptionsSnapshot<Configuration.PlaylistOptions> options) :
        base(serviceFactory)
    {
        ArgumentNullException.ThrowIfNull(options);

        this.options = options;
    }

    public async Task ExecuteAsync(PLCreateFromItemsCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var (deviceId, (title, (sourceDeviceId, ids, depth))) = command;
        var maxDepth = depth ?? options.Value.MaxContainerScanDepth;

        var sb = new StringBuilder();
        using(var writer = DIDLUtils.CreateDidlXmlWriter(sb))
        {
            await WriteItemsMetadataTreeAsync(sourceDeviceId, ids, writer, maxDepth, cancellationToken).ConfigureAwait(false);
        }

        await CreatePlaylistAsync(deviceId, title, sb.ToString(), cancellationToken).ConfigureAwait(false);
    }
}