using System.Diagnostics.CodeAnalysis;

using static IoT.Protocol.Upnp.Services.BrowseMode;
using static System.Globalization.CultureInfo;

#pragma warning disable CA1812 // Avoid uninstantiated internal classes - Instantiated by DI container
namespace Upnp.Control.Services.Queries
{
    internal sealed partial class GetContentQueryHandler : IAsyncQueryHandler<CDGetContentQuery, CDContent>
    {
        private readonly IUpnpServiceFactory factory;
        private readonly ILogger<GetContentQueryHandler> logger;

        public GetContentQueryHandler(IUpnpServiceFactory factory, ILogger<GetContentQueryHandler> logger)
        {
            ArgumentNullException.ThrowIfNull(factory);
            ArgumentNullException.ThrowIfNull(logger);

            this.factory = factory;
            this.logger = logger;
        }

        public async Task<CDContent> ExecuteAsync(CDGetContentQuery query, CancellationToken cancellationToken)
        {
            ArgumentNullException.ThrowIfNull(query);

            var (deviceId, path, (withParents, withResource, withVendor, withMetadata, _, take, skip)) = query;

            path ??= "0";

            var (service, description) = query.Options.WithDevice != false ?
                await factory.GetAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false) :
                (await factory.GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false), null);

            Item metadata = null;
            if(withMetadata == true)
            {
                var mr = await service.BrowseAsync(path, mode: BrowseMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);
                metadata = DIDLXmlParser.Parse(mr["Result"], withResource == true, withVendor == true).FirstOrDefault();
            }

            IEnumerable<Item> items = null;
            var total = 0;
            if(metadata is null or Container)
            {
                var result = await service.BrowseAsync(path, index: skip, count: take, cancellationToken: cancellationToken).ConfigureAwait(false);
                items = DIDLXmlParser.Parse(result["Result"], withResource == true, withVendor == true).ToArray();
                total = int.Parse(result["TotalMatches"], InvariantCulture);
            }

            IEnumerable<Item> parents = null;
            if(withParents != false)
            {
                parents = await GetParentsAsync(service, path, "id,title,parentId,res", withResource == true, withVendor == true, cancellationToken).ConfigureAwait(false);
            }

            return new CDContent(total, description, metadata, items, parents);
        }

        [SuppressMessage("Design", "CA1031: Do not catch general exception types", Justification = "By design")]
        private async Task<IEnumerable<Item>> GetParentsAsync(ContentDirectoryService service, string parent, string filter,
            bool withResource, bool withVendor, CancellationToken cancellationToken)
        {
            var parents = new List<Item>();

            var errorLimit = 1;

            while(parent != "-1" && errorLimit > 0)
            {
                try
                {
                    var metadataResult = await service.BrowseAsync(parent, mode: BrowseMetadata, filter: filter, cancellationToken: cancellationToken).ConfigureAwait(false);

                    var metadata = DIDLXmlParser.Parse(metadataResult["Result"], withResource, withVendor).FirstOrDefault();

                    if(metadata == null) break;

                    parents.Add(metadata);

                    parent = metadata.ParentId;
                }
                catch(Exception ex)
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
}