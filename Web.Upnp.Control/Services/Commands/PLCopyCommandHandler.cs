using System.Text;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands;

public sealed class PLCopyCommandHandler : IAsyncCommandHandler<PLCopyCommand>
{
    private readonly IUpnpServiceFactory factory;

    public PLCopyCommandHandler(IUpnpServiceFactory factory)
    {
        this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
    }

    public async Task ExecuteAsync(PLCopyCommand command, CancellationToken cancellationToken)
    {
        if(command is null) throw new ArgumentNullException(nameof(command));
        var (deviceId, playlistId, title) = command;
        var (cdService, plService) = await factory.GetServicesAsync<ContentDirectoryService, PlaylistService>(deviceId, cancellationToken).ConfigureAwait(false);

        var sb = new StringBuilder();
        using(var writer = DIDLUtils.CreateDidlXmlWriter(sb))
        {
            await foreach(var (content, _, _) in cdService.BrowseChildrenAsync(playlistId, pageSize: 100, cancellationToken: cancellationToken).ConfigureAwait(false))
            {
                DIDLUtils.CopyItems(content, writer, null, null);
            }
        }

        var result = await plService.CreateAsync(title: title, cancellationToken: cancellationToken).ConfigureAwait(false);
        await plService.AddUriAsync(0, result["AssignedObjectID"], "0", null, sb.ToString(), cancellationToken: cancellationToken).ConfigureAwait(false);
    }
}