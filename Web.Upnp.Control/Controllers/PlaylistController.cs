using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.DataAccess;

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]")]
    public class PlaylistController : Controller
    {
        private readonly UpnpDbContext context;

        public PlaylistController(UpnpDbContext context)
        {
            this.context = context;
        }

        [HttpPost("{deviceId}/remove")]
        public async Task RemoveAsync(string deviceId, [FromBody]string[] ids)
        {

        }
    }
}