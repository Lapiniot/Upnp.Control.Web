using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Soap;
using IoT.Protocol.Upnp;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public abstract class PLCommandBase
    {
        protected const string MissingArgumentErrorFormat = "{0} must be provided";

        protected PLCommandBase(IUpnpServiceFactory serviceFactory)
        {
            this.serviceFactory = serviceFactory ?? throw new ArgumentNullException(nameof(serviceFactory));
        }

        private IUpnpServiceFactory serviceFactory { get; }

        protected Task<T> GetServiceAsync<T>(string deviceId) where T : SoapActionInvoker
        {
            return serviceFactory.GetServiceAsync<T>(deviceId);
        }

        protected async Task<int[]> GetItemIndicesAsync(string deviceId, string parentId, IEnumerable<string> ids, CancellationToken cancellationToken)
        {
            var service = await GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            return await UpnpUtils.GetItemIndicesAsync(service, parentId, ids, cancellationToken).ConfigureAwait(false);
        }

        protected async Task<string> GetUpdateIdAsync(string deviceId, string itemId, CancellationToken cancellationToken)
        {
            var service = await GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            return await UpnpUtils.GetUpdateIdAsync(service, itemId, cancellationToken).ConfigureAwait(false);
        }

        protected async Task WriteItemsMetadataTreeAsync(string deviceId, IEnumerable<string> itemIds, XmlWriter writer, int maxDepth, CancellationToken cancellationToken)
        {
            var sourceCDService = await GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            await UpnpUtils.WriteItemsMetadataTreeAsync(sourceCDService, itemIds, writer, maxDepth, cancellationToken).ConfigureAwait(false);
        }

        protected async Task CreatePlaylistAsync(string deviceId, string title, string contentMetadata, CancellationToken cancellationToken)
        {
            var service = await GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var result = await service.CreateAsync(title: title, cancellationToken: cancellationToken).ConfigureAwait(false);
            await service.AddUriAsync(objectId: result["AssignedObjectID"], enqueuedUriMetaData: contentMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);
        }

        protected async Task AddItemAsync(string deviceId, string playlistId, string metadata, CancellationToken cancellationToken)
        {
            var playlistService = await GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var targetCDService = await GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            var updateId = await UpnpUtils.GetUpdateIdAsync(targetCDService, playlistId, cancellationToken).ConfigureAwait(false);
            await playlistService.AddUriAsync(0, playlistId, updateId, null, metadata, cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}