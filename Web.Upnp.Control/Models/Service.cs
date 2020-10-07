using System;
using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models
{
    public class Service
    {
        [JsonPropertyName("_id")]
        [JsonIgnore]
        public int Id { get; set; }

        public Service(string serviceId, string serviceType, Uri metadataUrl, Uri controlUrl, Uri eventsUrl)
        {
            ServiceId = serviceId;
            ServiceType = serviceType;
            MetadataUrl = metadataUrl;
            ControlUrl = controlUrl;
            EventsUrl = eventsUrl;
        }

        [JsonPropertyName("id")]
        public string ServiceId { get; set; }

        [JsonPropertyName("type")]
        public string ServiceType { get; set; }

        [JsonPropertyName("url")]
        public Uri MetadataUrl { get; set; }

        [JsonIgnore]
        public Uri ControlUrl { get; set; }

        [JsonIgnore]
        public Uri EventsUrl { get; set; }
    }
}