using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IoT.Protocol.Soap;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static IoT.Protocol.Upnp.Services.BrowseMode;

namespace Web.Upnp.Control.Services.Queries
{
    public class GetContentQueryHandler : IAsyncQueryHandler<CDGetContentQuery, ContentResult>
    {
        private readonly IUpnpServiceFactory factory;

        public GetContentQueryHandler(IUpnpServiceFactory factory)
        {
            this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public async Task<ContentResult> ExecuteAsync(CDGetContentQuery query, CancellationToken cancellationToken)
        {
            var (deviceId, path, (withParents, withResource, withVendor, take, skip)) = query;

            path ??= "0";

            var service = await factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);

            var result = await service.BrowseAsync(path, index: skip, count: take, cancellationToken: cancellationToken).ConfigureAwait(false);

            var parents = withParents != false
                ? await GetParentsAsync(service, path, "id,title,parentId,res", withResource == true, withVendor == true, cancellationToken).ConfigureAwait(false)
                : null;

            var items = DIDLXmlParser.Parse(result["Result"], withResource == true, withVendor == true);

            return new ContentResult(int.Parse(result["TotalMatches"]), items, parents);
        }

        private static async Task<IEnumerable<Item>> GetParentsAsync(ContentDirectoryService service, string path, string filter,
            bool withResource, bool withVendor, CancellationToken cancellationToken)
        {
            var parents = new List<Item>();

            var errorLimit = 1;

            while(path != "-1" && errorLimit > 0)
            {
                try
                {
                    var metadataResult = await service.BrowseAsync(path, mode: BrowseMetadata, filter: filter, cancellationToken: cancellationToken).ConfigureAwait(false);

                    var metadata = DIDLXmlParser.Parse(metadataResult["Result"], withResource, withVendor).FirstOrDefault();

                    if(metadata == null) break;

                    parents.Add(metadata);

                    path = metadata.ParentId;
                }
                catch(SoapException se) when(se.Code == 701)
                {
                    path = "0";
                    errorLimit--;
                }
            }

            return parents;
        }
    }
}