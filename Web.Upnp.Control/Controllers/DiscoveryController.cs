using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using IoT.Device.Xiaomi.Umi;
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
            return await GetUpnpDevices();
        }

        // GET api/<controller>/5
        [HttpGet("{type}")]
        public async Task<IEnumerable<object>> Get(string type)
        {
            switch(type)
            {
                case "umi":
                    return await GetUmiDevicesAsync();
                case "upnp":
                    return await GetUpnpDevices();
                default:
                    throw new ArgumentException("Inalid value", nameof(type));
            }
        }

        private static Task<IEnumerable<object>> GetUpnpDevices()
        {

            var enumerator = new UpnpDeviceEnumerator(UpnpServices.RootDevice);

            return GetAllMetadataAsync(enumerator.Enumerate(TimeSpan.FromSeconds(5)));
        }

        private async Task<IEnumerable<object>> GetUmiDevicesAsync()
        {
            var enumerator = new UmiSpeakerEnumerator();

            return await GetAllMetadataAsync(enumerator.Enumerate(TimeSpan.FromSeconds(5)));

        }

        private static async Task<IEnumerable<object>> GetAllMetadataAsync(IEnumerable<UpnpDevice> devices)
        {
            var tasks = devices.Select(d => d.GetDescriptionAsync()).ToList();

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
                Icons = t.Result.Icons.Select(i => new { W = i.Width, H = i.Height, Url = i.Uri }),
                Services = t.Result.Services.Select(s => new { Id = s.ServiceId, Url = s.MetadataUri }).ToArray()
            });
        }
    }
}