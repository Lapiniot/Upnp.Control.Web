using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IoT.Protocol;
using IoT.Protocol.Upnp;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.Models;

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
            List<Task<UpnpDeviceDescription>> tasks = new List<Task<UpnpDeviceDescription>>();

            var enumerator = new IoT.Device.Upnp.UpnpDeviceEnumerator(UpnpServices.RootDevice);

            foreach(var d in enumerator.Enumerate(TimeSpan.FromSeconds(5)))
            {
                tasks.Add(d.GetDescriptionAsync());
            }

            await Task.WhenAll(tasks);

            return tasks.Where(t => t.IsCompletedSuccessfully).
                Select(t => new
                {
                    Udn = t.Result.Udn,
                    Url = t.Result.Location,
                    DeviceType = t.Result.DeviceType,
                    Name = t.Result.FriendlyName,
                    Manufacturer = t.Result.Manufacturer,
                    Description = t.Result.ModelDescription,
                    ModelName = t.Result.ModelName,
                    ModelNumber = t.Result.ModelNumber,
                    Icons = t.Result.Icons.Select(i => new { W = i.Width, H = i.Height, Url = i.Uri }),
                    Services = t.Result.Services.Select(s => new { Id = s.ServiceId, url = s.MetadataUri }).ToArray()
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