using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp.Services;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;
using static IoT.Protocol.Upnp.Services.BrowseMode;

namespace Web.Upnp.Control.Services.Commands
{
    public class PLAddItemsCommand : PLCommandBase, IAsyncCommand<PLAddItemsParams>
    {
        public PLAddItemsCommand(IUpnpServiceFactory factory) : base(factory) {}

        public async Task ExecuteAsync(PLAddItemsParams commandParameters, CancellationToken cancellationToken)
        {
            var (deviceId, playlistId, sourceDeviceId, sourceItems) = commandParameters;
            var playlistService = await Factory.GetServiceAsync<PlaylistService>(deviceId).ConfigureAwait(false);
            var targetCDService = await Factory.GetServiceAsync<ContentDirectoryService>(deviceId).ConfigureAwait(false);
            var sourceCDService = await Factory.GetServiceAsync<ContentDirectoryService>(sourceDeviceId).ConfigureAwait(false);

            XDocument xdoc = null;

            foreach(var item in sourceItems)
            {
                var data = await sourceCDService.BrowseAsync(item, mode: BrowseMetadata, cancellationToken: cancellationToken).ConfigureAwait(false);

                var xml = data["Result"];

                if(xdoc == null)
                {
                    xdoc = XDocument.Parse(xml);
                }
                else
                {
                    var x = XDocument.Parse(xml);
                    xdoc.Root.Add(x.Root.Elements());
                }
            }

            var updateId = await GetUpdateIdAsync(targetCDService, playlistId, cancellationToken).ConfigureAwait(false);

            await playlistService.AddUriAsync(objectId: playlistId, updateId: updateId, enqueuedUriMetaData: xdoc.ToString(), cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}