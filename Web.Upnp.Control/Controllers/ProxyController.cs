using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Services.HttpClients;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProxyController : ControllerBase
    {
        private readonly ImageLoaderProxyClient proxyClient;

        public ProxyController(ImageLoaderProxyClient proxyClient)
        {
            this.proxyClient = proxyClient;
        }

        [HttpGet("[action]/{*originalUri}")]
        [ResponseCache(Duration = 10 * 60, NoStore = false, Location = ResponseCacheLocation.Any)]
        public async Task GetAsync(string originalUri)
        {
            var responseMessage = await proxyClient.GetAsync(originalUri, Request.Headers).ConfigureAwait(false);
            var content = responseMessage.Content;

            Response.StatusCode = (int)responseMessage.StatusCode;

            foreach(var (key, value) in responseMessage.Headers)
            {
                if(!Response.Headers.TryGetValue(key, out _))
                {
                    Response.Headers.Add(key, value.ToArray());
                }
            }

            foreach(var (key, value) in content.Headers)
            {
                if(!Response.Headers.TryGetValue(key, out _))
                {
                    Response.Headers.Add(key, value.ToArray());
                }
            }

            await content.CopyToAsync(Response.Body).ConfigureAwait(false);
            await Response.CompleteAsync().ConfigureAwait(false);
        }
    }
}