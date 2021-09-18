using System.Text;
using IoT.Protocol.Upnp.DIDL;
using Microsoft.Extensions.Options;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands;

public sealed class PLCreateFromItemsCommandHandler : PLCommandBase, IAsyncCommandHandler<PLCreateFromItemsCommand>
{
    private readonly IOptionsSnapshot<PlaylistOptions> options;

    public PLCreateFromItemsCommandHandler(IUpnpServiceFactory serviceFactory, IOptionsSnapshot<PlaylistOptions> options) :
        base(serviceFactory)
    {
        this.options = options ?? throw new ArgumentNullException(nameof(options));
    }

    public async Task ExecuteAsync(PLCreateFromItemsCommand command, CancellationToken cancellationToken)
    {
        if(command is null) throw new ArgumentNullException(nameof(command));

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