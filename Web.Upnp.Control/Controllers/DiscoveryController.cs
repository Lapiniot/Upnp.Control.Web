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

        [HttpGet]
        public Task<IEnumerable<object>> GetAsync()
        {
            return GetUpnpDevicesAsync();
        }

        [HttpGet("{type}")]
        public Task<IEnumerable<object>> GetAsync(string type)
        {
            switch(type)
            {
                case "umi":
                    return GetUmiDevicesAsync();
                case "upnp":
                    return GetUpnpDevicesAsync();
                default:
                    throw new ArgumentException("Invalid value", nameof(type));
            }
        }

        private async Task<IEnumerable<object>> GetUpnpDevicesAsync()
        {
            return await context.UpnpDevices
                .Include(d => d.Icons)
                .Include(d => d.Services)
                .Where(d => d.IsOnline)
                .ToArrayAsync()
                .ConfigureAwait(false);
        }

        private async Task<IEnumerable<object>> GetUmiDevicesAsync()
        {
            return await context.UpnpDevices
                .Include(d => d.Icons)
                .Include(d => d.Services)
                .Where(d => d.IsOnline && d.Description == "The Mi WiFi SoundBox")
                .ToArrayAsync()
                .ConfigureAwait(false);
        }
    }
}