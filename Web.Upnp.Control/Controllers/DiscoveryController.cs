using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.DataAccess;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]")]
    public class DiscoveryController : Controller
    {
        private readonly UpnpDbContext context;

        public DiscoveryController(UpnpDbContext context)
        {
            this.context = context;
        }

        // GET: api/<controller>
        [HttpGet]
        public Task<IEnumerable<object>> Get()
        {
            return GetUpnpDevicesAsync();
        }

        // GET api/<controller>/5
        [HttpGet("{type}")]
        public async Task<IEnumerable<object>> Get(string type)
        {
            switch(type)
            {
                case "umi":
                    return await GetUmiDevicesAsync().ConfigureAwait(false);
                case "upnp":
                    return await GetUpnpDevicesAsync().ConfigureAwait(false);
                default:
                    throw new ArgumentException("Inalid value", nameof(type));
            }
        }

        private async Task<IEnumerable<object>> GetUpnpDevicesAsync()
        {
            return await context.UpnpDevices.Include(d => d.Icons).Include(d => d.Services).Where(d => d.IsOnline).ToArrayAsync();
        }

        private async Task<IEnumerable<object>> GetUmiDevicesAsync()
        {
            return await context.UpnpDevices.Include(d => d.Icons).Include(d => d.Services).Where(d => d.IsOnline && d.Description == "The Mi WiFi SoundBox").ToArrayAsync();
        }
    }
}