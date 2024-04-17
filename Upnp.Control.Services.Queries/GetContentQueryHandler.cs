using static IoT.Device.Upnp.Services.BrowseMode;
using static System.Globalization.CultureInfo;

namespace Upnp.Control.Services.Queries;

internal sealed partial class GetContentQueryHandler(IUpnpServiceFactory factory,
    IAsyncQueryHandler<GetDeviceDescriptionQuery, DeviceDescription> queryHandler,
    ILogger<GetContentQueryHandler> logger) :
    IAsyncQueryHandler<CDGetContentQuery, CDContent>,
    IAsyncQueryHandler<CDSearchContentQuery, CDContent>
{
#pragma warning disable CA1823 // Avoid unused private fields
    private readonly ILogger<GetContentQueryHandler> logger = logger;
#pragma warning restore CA1823 // Avoid unused private fields

    public async Task<CDContent> ExecuteAsync(CDGetContentQuery query, CancellationToken cancellationToken)
    {
        var (deviceId, path, options) = query;
        path ??= "0";

        var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);

        var childrenTask = options.WithChildren
            ? GetChildrenAsync(service, path, options, cancellationToken)
            : Task.FromResult<(IEnumerable<Item> items, int total)>(default);

        var descriptionTask = options.WithDevice
            ? queryHandler.ExecuteAsync(new(deviceId), cancellationToken)
            : Task.FromResult<DeviceDescription>(null);

        var metadataTask = GetMetadataAsync(service, path, query.Options, cancellationToken);

        await Task.WhenAll(descriptionTask, childrenTask, metadataTask).ConfigureAwait(false);

        (var items, var total) = childrenTask.GetAwaiter().GetResult();
        (var metadata, var parents) = metadataTask.GetAwaiter().GetResult();
        var description = descriptionTask.GetAwaiter().GetResult();

        return new(total, description, metadata, items, parents);
    }

    public async Task<CDContent> ExecuteAsync(CDSearchContentQuery query, CancellationToken cancellationToken)
    {
        var (deviceId, path, criteria, options) = query;
        path ??= "0";

        var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);

        var childrenTask = SearchAsync(service, path, criteria, options, cancellationToken);

        var descriptionTask = options.WithDevice
            ? queryHandler.ExecuteAsync(new(deviceId), cancellationToken)
            : Task.FromResult<DeviceDescription>(null);

        var metadataTask = GetMetadataAsync(service, path, query.Options, cancellationToken);

        await Task.WhenAll(descriptionTask, childrenTask, metadataTask).ConfigureAwait(false);

        (var items, var total) = childrenTask.GetAwaiter().GetResult();
        (var metadata, var parents) = metadataTask.GetAwaiter().GetResult();
        var description = descriptionTask.GetAwaiter().GetResult();

        return new(total, description, metadata, items, parents);
    }

    private async Task<(Item Metadata, List<Item> Parents)> GetMetadataAsync(ContentDirectoryService service,
        string path, GetContentOptions options, CancellationToken cancellationToken)
    {
        var metadataTask = options.WithMetadata
            ? GetItemMetadataAsync(service, path, options.WithResourceProps, options.WithVendorProps, cancellationToken)
            : Task.FromResult<Item>(null);
        var parentsTask = options.WithParents
            ? GetParentsAsync(service, path, "id,title,parentId,res", options.WithResourceProps, options.WithVendorProps, cancellationToken)
            : Task.FromResult<List<Item>>(null);
        await Task.WhenAll(metadataTask, parentsTask).ConfigureAwait(false);
        return (metadataTask.GetAwaiter().GetResult(), parentsTask.GetAwaiter().GetResult());
    }

    private static async Task<(IEnumerable<Item>, int)> GetChildrenAsync(ContentDirectoryService service,
        string path, GetContentOptions options, CancellationToken cancellationToken)
    {
        var mr = await service.BrowseAsync(path, index: options.Skip, count: options.Take, cancellationToken: cancellationToken).ConfigureAwait(false);
        var items = DIDLXmlReader.Read(mr["Result"], options.WithResourceProps, options.WithVendorProps).ToArray();
        var total = int.Parse(mr["TotalMatches"], InvariantCulture);
        return (items, total);
    }

    private static async Task<(IEnumerable<Item>, int)> SearchAsync(ContentDirectoryService service,
        string path, string criteria, GetContentOptions options, CancellationToken cancellationToken)
    {
        var mr = await service.SearchAsync(path, criteria, index: options.Skip, count: options.Take, cancellationToken: cancellationToken).ConfigureAwait(false);
        var items = DIDLXmlReader.Read(mr["Result"], options.WithResourceProps, options.WithVendorProps).ToArray();
        var total = int.Parse(mr["TotalMatches"], InvariantCulture);
        return (items, total);
    }

    private static async Task<Item> GetItemMetadataAsync(ContentDirectoryService service, string path,
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