using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models.Database.Upnp
{
    public class Device
    {
        public Device(string udn, Uri location, string deviceType, string friendlyName, string manufacturer, string description, string modelName, string modelNumber)
        {
            Udn = udn;
            Location = location;
            DeviceType = deviceType;
            FriendlyName = friendlyName;
            Manufacturer = manufacturer;
            Description = description;
            ModelName = modelName;
            ModelNumber = modelNumber;
        }

        [Key]
        public string Udn { get; set; }

        [JsonPropertyName("url")]
        public Uri Location { get; set; }

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

        public bool IsOnline { get; set; }

        [JsonIgnore]
        public DateTime ExpiresAt { get; set; }

        public ICollection<Icon> Icons { get; set; }

        public ICollection<Service> Services { get; set; }
    }
}