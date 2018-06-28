using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IoT.Protocol.Soap;
using IoT.Protocol.Upnp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;
using static IoT.Protocol.Upnp.UpnpServices;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]")]
    public class BrowseController : Controller
    {
        private readonly UpnpDbContext context;

        public BrowseController(UpnpDbContext context)
        {
            this.context = context;
        }

        // GET: api/<controller>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new[] {"value1", "value2"};
        }

        // GET api/<controller>/5
        [HttpGet("{id}/{path?}")]
        public async Task<IEnumerable<object>> GetContentAsync(string id, string path)
        {
            var device = await context.UpnpDevices.Include(d => d.Services).Where(d => d.Udn == id).FirstAsync().ConfigureAwait(false);

            var cds = device.Services.First(s => s.ServiceType == ContentDirectory);

            var endpoint = new SoapControlEndpoint(new Uri(cds.ControlUrl));

            var service = new ContentDirectoryService(endpoint);

            endpoint.Connect();

            var content = await service.BrowseAsync("0").ConfigureAwait(false);

            return null;
        }
    }
}