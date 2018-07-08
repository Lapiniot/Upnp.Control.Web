using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using IoT.Protocol.Soap;
using IoT.Protocol.Upnp.DIDL;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using Web.Upnp.Control.Models.Database.Upnp;
using static IoT.Protocol.Upnp.UpnpServices;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]")]
    public class ProxyController : Controller
    {
        private readonly IHttpClientFactory clientFactory;
        public ProxyController(IHttpClientFactory clientFactory)
        {
            this.clientFactory = clientFactory;
        }

        [HttpGet("{*originalUri}")]
        [ResponseCache(Duration = 10 * 60)]
        public async Task<HttpResponseMessage> GetContentAsync(string originalUri)
        {
            HttpClient client = clientFactory.CreateClient("ImageLoader");

            HttpRequestMessage message = new HttpRequestMessage(HttpMethod.Get, originalUri);

            foreach(var h in Request.Headers)
            {
                if(h.Key == "Host") continue;

                message.Headers.TryAddWithoutValidation(h.Key, (IEnumerable<string>)h.Value);
            }

            return await client.SendAsync(message).ConfigureAwait(false);
        }
    }
}