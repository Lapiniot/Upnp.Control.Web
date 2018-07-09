using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

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
        public Task<HttpResponseMessage> GetContentAsync(string originalUri)
        {
            var client = clientFactory.CreateClient("ImageLoader");

            var message = new HttpRequestMessage(HttpMethod.Get, originalUri);

            foreach(var h in Request.Headers)
            {
                if(h.Key == "Host") continue;

                message.Headers.TryAddWithoutValidation(h.Key, (IEnumerable<string>)h.Value);
            }

            return client.SendAsync(message);
        }
    }
}