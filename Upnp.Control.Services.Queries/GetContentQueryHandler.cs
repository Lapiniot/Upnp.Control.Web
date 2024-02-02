using static IoT.Device.Upnp.Services.BrowseMode;
using static System.Globalization.CultureInfo;

namespace Upnp.Control.Services.Queries;

internal sealed partial class GetContentQueryHandler(IUpnpServiceFactory factory,
    IAsyncQueryHandler<GetDeviceDescriptionQuery, DeviceDescription> queryHandler,
    ILogger<GetContentQueryHandler> logger) :
    IAsyncQueryHandler<CDGetContentQuery, CDContent>
{
#pragma warning disable CA1823 // Avoid unused private fields
    private readonly ILogger<GetContentQueryHandler> logger = logger;
#pragma warning restore CA1823 // Avoid unused private fields

    public async Task<CDContent> ExecuteAsync(CDGetContentQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var (deviceId, path, (withChildren, withParents, withResource, withVendor, withMetadata, withDevice, take, skip)) = query;
        path ??= "0";

        var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);

        var descriptionTask = withDevice
            ? queryHandler.ExecuteAsync(new(deviceId), cancellationToken)
            : Task.FromResult<DeviceDescription>(null);

        var childrenTask = withChildren
            ? GetChildrenAsync(service, path, withResource, withVendor, take, skip, cancellationToken)
            : Task.FromResult<(IEnumerable<Item> items, int total)>(default);

        var metadataTask = withMetadata
            ? GetMetadataAsync(service, path, withResource, withVendor, cancellationToken)
            : Task.FromResult<Item>(null);

        var parentsTask = withParents
            ? GetParentsAsync(service, path, "id,title,parentId,res", withResource, withVendor, cancellationToken)
            : Task.FromResult<List<Item>>(null);

        await Task.WhenAll([descriptionTask, childrenTask, metadataTask, parentsTask]).ConfigureAwait(false);

        var description = descriptionTask.GetAwaiter().GetResult();
        var metadata = metadataTask.GetAwaiter().GetResult();
        var parents = parentsTask.GetAwaiter().GetResult();
        (var items, var total) = childrenTask.GetAwaiter().GetResult();

        return new(total, description, metadata, items, parents);
    }

    private static async Task<(IEnumerable<Item>, int)> GetChildrenAsync(ContentDirectoryService service, string path,
        bool withResource, bool withVendor, uint take, uint skip, CancellationToken cancellationToken)
    {
        var mr = await service.BrowseAsync(path, index: skip, count: take, cancellationToken: cancellationToken).ConfigureAwait(false);
        var items = DIDLXmlReader.Read(mr["Result"], withResource, withVendor).ToArray();
        var total = int.Parse(mr["TotalMatches"], InvariantCulture);
        return (items, total);
    }

    private static async Task<Item> GetMetadataAsync(ContentDirectoryService service, string path,
        bool withResource, bool withVendor, CancellationToken cancellationToken)
    {
        var mr = await service.BrowseAsync(path, mode: BrowseMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);
        return DIDLXmlReader.Read(mr["Result"], withResource, withVendor).FirstOrDefault();
    }

    private async Task<List<Item>> GetParentsAsync(ContentDirectoryService service, string parent, string filter,
        bool withResource, bool withVendor, CancellationToken cancellationToken)
    {
        var parents = new List<Item>();
        var errorLimit = 1;

        while (parent != "-1" && errorLimit > 0)
        {
            try
            {
                var mr = await service.BrowseAsync(parent, mode: BrowseMetadata, filter: filter, cancellationToken: cancellationToken).ConfigureAwait(false);
                var metadata = DIDLXmlReader.Read(mr["Result"], withResource, withVendor).FirstOrDefault();
                if (metadata == null) break;
                parents.Add(metadata);
                parent = metadata.ParentId;
            }
#pragma warning disable CA1031 // Do not catch general exception types
            catch (Exception ex)
#pragma warning restore CA1031 // Do not catch general exception types
            {
                errorLimit--;
                parent = "0";
                LogQueryError(ex, parent);
            }
        }

        return parents;
    }

    [LoggerMessage(1, LogLevel.Error, "Query BrowseMetadata failed for item '{id}'")]
    private partial void LogQueryError(Exception exception, string id);
}