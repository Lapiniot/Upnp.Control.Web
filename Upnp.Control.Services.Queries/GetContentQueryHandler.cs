using System.Diagnostics.CodeAnalysis;
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

        var (deviceId, path, (withParents, withResource, withVendor, withMetadata, withDevice, take, skip)) = query;

        path ??= "0";

        var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);

        var description = withDevice ? await queryHandler.ExecuteAsync(new(deviceId), cancellationToken).ConfigureAwait(false) : null;

        Item metadata = null;
        if (withMetadata)
        {
            var mr = await service.BrowseAsync(path, mode: BrowseMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);
            metadata = DIDLXmlReader.Read(mr["Result"], withResource, withVendor).FirstOrDefault();
        }

        IEnumerable<Item> items = null;
        var total = 0;
        if (metadata is null or Container)
        {
            var result = await service.BrowseAsync(path, index: skip, count: take, cancellationToken: cancellationToken).ConfigureAwait(false);
            items = DIDLXmlReader.Read(result["Result"], withResource, withVendor).ToArray();
            total = int.Parse(result["TotalMatches"], InvariantCulture);
        }

        IEnumerable<Item> parents = null;
        if (withParents)
        {
            parents = await GetParentsAsync(service, path, "id,title,parentId,res", withResource, withVendor, cancellationToken).ConfigureAwait(false);
        }

        return new(total, description, metadata, items, parents);
    }

    [SuppressMessage("Design", "CA1031: Do not catch general exception types", Justification = "By design")]
    private async Task<IEnumerable<Item>> GetParentsAsync(ContentDirectoryService service, string parent, string filter,
        bool withResource, bool withVendor, CancellationToken cancellationToken)
    {
        var parents = new List<Item>();

        var errorLimit = 1;

        while (parent != "-1" && errorLimit > 0)
        {
            try
            {
                var metadataResult = await service.BrowseAsync(parent, mode: BrowseMetadata, filter: filter, cancellationToken: cancellationToken).ConfigureAwait(false);

                var metadata = DIDLXmlReader.Read(metadataResult["Result"], withResource, withVendor).FirstOrDefault();

                if (metadata == null) break;

                parents.Add(metadata);

                parent = metadata.ParentId;
            }
            catch (Exception ex)
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