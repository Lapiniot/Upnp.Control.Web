using System.Text;

namespace Upnp.Control.Services.Commands;

internal sealed class PLCopyCommandHandler : IAsyncCommandHandler<PLCopyCommand>
{
    private readonly IUpnpServiceFactory factory;

    public PLCopyCommandHandler(IUpnpServiceFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        this.factory = factory;
    }

    public async Task ExecuteAsync(PLCopyCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var (deviceId, playlistId, title) = command;
        var (cdService, plService) = await factory.GetServicesAsync<ContentDirectoryService, PlaylistService>(deviceId, cancellationToken).ConfigureAwait(false);

        var sb = new StringBuilder();
        await using (var writer = DIDLUtils.CreateDidlXmlWriter(sb))
        {
            await foreach (var (content, _, _) in cdService.BrowseChildrenAsync(playlistId, pageSize: 100, cancellationToken: cancellationToken).ConfigureAwait(false))
            {
                DIDLUtils.CopyItems(content, writer, null, null);
            }
        }

        var result = await plService.CreateAsync(title: title, cancellationToken: cancellationToken).ConfigureAwait(false);
        await plService.AddUriAsync(0, result["AssignedObjectID"], "0", null, sb.ToString(), cancellationToken: cancellationToken).ConfigureAwait(false);
    }
}