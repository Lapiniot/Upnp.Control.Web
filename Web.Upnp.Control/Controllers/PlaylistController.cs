using System.Linq;
using System.Threading.Tasks;
using IoT.Device.Xiaomi.Umi.Services;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Services;

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]/{deviceId}")]
    public class PlaylistController : Controller
    {
        private readonly IUpnpServiceFactory factory;

        public PlaylistController(IUpnpServiceFactory factory)
        {
            this.factory = factory;
        }

        [HttpDelete("remove")]
        public async Task<object> RemoveAsync(string deviceId, [FromBody] string[] ids)
        {
            var cdService = await factory.GetServiceAsync<ContentDirectoryService>(deviceId);

            var plService = await factory.GetServiceAsync<PlaylistService>(deviceId);

            using(cdService.Target)
            using(plService.Target)
            {
                var data = await cdService.BrowseAsync("PL:", count: uint.MaxValue).ConfigureAwait(false);
                var playlists = DIDLParser.Parse(data["Result"]);
                var map = playlists.Select((p, index) => (p.Id, index)).ToDictionary(p => p.Id, p => p.index + 1);
                var indices = ids.Select(id => map[id]).ToArray();
                var result = await plService.DeleteAsync(indices: indices).ConfigureAwait(false);
                if(result["LengthChange"] == "0")
                {
                    result = await plService.DeleteAsync(updateId: result["NewUpdateID"], indices: indices).ConfigureAwait(false);
                }

                return result;
            }
        }
    }
}