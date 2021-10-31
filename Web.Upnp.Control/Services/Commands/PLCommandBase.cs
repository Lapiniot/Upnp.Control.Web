using System.Xml;
using IoT.Device.Upnp.Umi.Services;
using IoT.Protocol.Soap;
using IoT.Protocol.Upnp;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands;

public abstract class PLCommandBase
{
    protected const string MissingArgumentErrorFormat = "{0} must be provided";
    private readonly IUpnpServiceFactory serviceFactory;

    protected PLCommandBase(IUpnpServiceFactory serviceFactory)
    {
        ArgumentNullException.ThrowIfNull(serviceFactory);

        this.serviceFactory = serviceFactory;
    }

    protected Task<T> GetServiceAsync<T>(string deviceId, CancellationToken cancellationToken) where T : SoapActionInvoker
    {
        return serviceFactory.GetServiceAsync<T>(deviceId, cancellationToken);
    }

    protected async Task<int[]> GetItemIndicesAsync(string deviceId, string parentId, IEnumerable<string> ids, CancellationToken cancellationToken)
    {
        var service = await GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);
        return await UpnpUtils.GetItemIndicesAsync(service, parentId, ids, cancellationToken).ConfigureAwait(false);
    }

    protected async Task<string> GetUpdateIdAsync(string deviceId, string itemId, CancellationToken cancellationToken)
    {
        var service = await GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);
        return await UpnpUtils.GetUpdateIdAsync(service, itemId, cancellationToken).ConfigureAwait(false);
    }

    protected async Task WriteItemsMetadataTreeAsync(string deviceId, IEnumerable<string> itemIds, XmlWriter writer, int maxDepth, CancellationToken cancellationToken)
    {
        var sourceCDService = await GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);
        await UpnpUtils.WriteItemsMetadataTreeAsync(sourceCDService, itemIds, writer, maxDepth, cancellationToken).ConfigureAwait(false);
    }

    protected async Task CreatePlaylistAsync(string deviceId, string title, string contentMetadata, CancellationToken cancellationToken)
    {
        var service = await GetServiceAsync<PlaylistService>(deviceId, cancellationToken).ConfigureAwait(false);
        var result = await service.CreateAsync(title: title, cancellationToken: cancellationToken).ConfigureAwait(false);
        await service.AddUriAsync(objectId: result["AssignedObjectID"], enqueuedUriMetaData: contentMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);
    }

    protected async Task AddItemAsync(string deviceId, string playlistId, string metadata, CancellationToken cancellationToken)
    {
        var playlistService = await GetServiceAsync<PlaylistService>(deviceId, cancellationToken).ConfigureAwait(false);
        var targetCDService = await GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);
        var updateId = await UpnpUtils.GetUpdateIdAsync(targetCDService, playlistId, cancellationToken).ConfigureAwait(false);
        await playlistService.AddUriAsync(0, playlistId, updateId, null, metadata, cancellationToken: cancellationToken).ConfigureAwait(false);
    }
}