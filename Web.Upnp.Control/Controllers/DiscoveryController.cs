using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using IoT.Protocol;
using IoT.Protocol.Upnp;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]")]
    public class DiscoveryController : Controller
    {
        // GET: api/<controller>
        [HttpGet]
        public async Task<IEnumerable<object>> Get()
        {
            var tasks = new List<Task<UpnpDeviceDescription>>();

            var enumerator = new UpnpDeviceEnumerator(UpnpServices.RootDevice);

            foreach(var d in enumerator.Enumerate(TimeSpan.FromSeconds(5)))
            {
                tasks.Add(d.GetDescriptionAsync());
            }

            await Task.WhenAll(tasks).ConfigureAwait(false);

            return tasks.Where(t => t.IsCompletedSuccessfully).Select(t => new
            {
                t.Result.Udn,
                Url = t.Result.Location,
                t.Result.DeviceType,
                Name = t.Result.FriendlyName,
                t.Result.Manufacturer,
                Description = t.Result.ModelDescription,
                t.Result.ModelName,
                t.Result.ModelNumber,
                Icons = t.Result.Icons.Select(i => new {W = i.Width, H = i.Height, Url = i.Uri}),
                Services = t.Result.Services.Select(s => new {Id = s.ServiceId, Url = s.MetadataUri}).ToArray()
            });
        }

        // GET api/<controller>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }
    }
}