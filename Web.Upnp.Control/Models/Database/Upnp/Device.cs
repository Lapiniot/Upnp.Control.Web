using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models.Database.Upnp
{
    public class Device
    {
        [Key]
        public string Udn { get; set; }

        [JsonPropertyName("url")]
        public string Location { get; set; }

        [JsonPropertyName("type")]
        public string DeviceType { get; set; }

        [JsonPropertyName("name")]
        public string FriendlyName { get; set; }

        [JsonPropertyName("maker")]
        public string Manufacturer { get; set; }

        public string Description { get; set; }

        [JsonPropertyName("model")]
        public string ModelName { get; set; }

        public string ModelNumber { get; set; }

        public List<Icon> Icons { get; set; }

        public List<Service> Services { get; set; }

        public bool IsOnline { get; set; }
    }
}