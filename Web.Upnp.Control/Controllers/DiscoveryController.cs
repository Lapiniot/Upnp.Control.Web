using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IoT.Device.Upnp;
using IoT.Device.Xiaomi.Umi;
using IoT.Protocol;
using IoT.Protocol.Upnp;
using Microsoft.AspNetCore.Mvc;
using Web.Upnp.Control.DataAccess;
using UpnpDevice = IoT.Device.Upnp.UpnpDevice;

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
            return GetUpnpDevices();
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
                    return await GetUpnpDevices().ConfigureAwait(false);
                default:
                    throw new ArgumentException("Inalid value", nameof(type));
            }
        }

        private static Task<IEnumerable<object>> GetUpnpDevices()
        {
            var enumerator = new UpnpDeviceEnumerator(UpnpServices.RootDevice);

            return GetAllMetadataAsync(enumerator.Enumerate(TimeSpan.FromSeconds(5)));
        }

        private Task<IEnumerable<object>> GetUmiDevicesAsync()
        {
            var enumerator = new UmiSpeakerEnumerator();

            return GetAllMetadataAsync(enumerator.Enumerate(TimeSpan.FromSeconds(5)));
        }

        private static async Task<IEnumerable<object>> GetAllMetadataAsync(IEnumerable<UpnpDevice> devices)
        {
            var tasks = devices.Select(d => d.GetDescriptionAsync()).ToList();

            await Task.WhenAll(tasks).ConfigureAwait(false);

            return tasks.Where(t => t.IsCompletedSuccessfully).Select(t => new DataAccess.UpnpDevice
            {
                Udn = t.Result.Udn,
                Location = t.Result.Location.AbsoluteUri,
                DeviceType = t.Result.DeviceType,
                FriendlyName = t.Result.FriendlyName,
                Manufacturer = t.Result.Manufacturer,
                Description = t.Result.ModelDescription,
                ModelName = t.Result.ModelName,
                ModelNumber = t.Result.ModelNumber,
                Icons = t.Result.Icons.Select(i => new UpnpDeviceIcon {Width = i.Width, Height = i.Height, Url = i.Uri.AbsoluteUri}).ToList(),
                Services = t.Result.Services.Select(s => new UpnpService {Id = s.ServiceId, Url = s.MetadataUri}).ToList()
            });
        }
    }
}