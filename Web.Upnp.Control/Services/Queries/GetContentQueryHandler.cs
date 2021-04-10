using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.Extensions.Logging;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static IoT.Protocol.Upnp.Services.BrowseMode;
using static System.Globalization.CultureInfo;
using System.Diagnostics.CodeAnalysis;

namespace Web.Upnp.Control.Services.Queries
{
    public sealed class GetContentQueryHandler : IAsyncQueryHandler<CDGetContentQuery, CDContent>
    {
        private readonly IUpnpServiceFactory factory;
        private readonly ILogger<GetContentQueryHandler> logger;

        public GetContentQueryHandler(IUpnpServiceFactory factory, ILogger<GetContentQueryHandler> logger)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
            this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<CDContent> ExecuteAsync(CDGetContentQuery query, CancellationToken cancellationToken)
        {
            if(query is null) throw new ArgumentNullException(nameof(query));

            var (deviceId, path, (withParents, withResource, withVendor, withMetadata, take, skip)) = query;

            path ??= "0";

            var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId, cancellationToken).ConfigureAwait(false);

            Item metadata = null;
            if(withMetadata == true)
            {
                var mr = await service.BrowseAsync(path, mode: BrowseMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);
                metadata = DIDLXmlParser.Parse(mr["Result"], withResource == true, withVendor == true).FirstOrDefault();
            }

            IEnumerable<Item> items = null;
            var total = 0;
            if(metadata is null || metadata is Container)
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

            return new CDContent(total, metadata, items, parents);
        }

        [SuppressMessage("Microsoft.Design", "CA1031: Do not catch general exception types", Justification = "By design")]
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
                    logger.LogError(ex, $"Query BrowseMetadata failed for item '{parent}'");
                }
            }

            return parents;
        }
    }
}