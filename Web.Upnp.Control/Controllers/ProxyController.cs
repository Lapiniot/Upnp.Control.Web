using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Services.HttpClients;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]")]
    public class ProxyController : Controller
    {
        private readonly ImageLoaderProxyClient proxyClient;

        public ProxyController(ImageLoaderProxyClient proxyClient)
        {
            this.proxyClient = proxyClient;
        }

        [HttpGet("{*originalUri}")]
        [ResponseCache(Duration = 10 * 60)]
        public Task<HttpResponseMessage> GetContentAsync(string originalUri)
        {
            return proxyClient.GetAsync(originalUri, Request.Headers);
        }
    }
}