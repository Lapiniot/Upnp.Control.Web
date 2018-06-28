using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Web.Upnp.Control.Models.Database.Upnp
{
    public class Device
    {
        [Key]
        public string Udn { get; set; }

        [JsonProperty("url")]
        public string Location { get; set; }

        [JsonProperty("type")]
        public string DeviceType { get; set; }

        [JsonProperty("name")]
        public string FriendlyName { get; set; }

        [JsonProperty("maker")]
        public string Manufacturer { get; set; }

        public string Description { get; set; }

        [JsonProperty("model")]
        public string ModelName { get; set; }

        public string ModelNumber { get; set; }

        public List<Icon> Icons { get; set; }

        public List<Service> Services { get; set; }

        public bool IsOnline { get; set; }
    }
}