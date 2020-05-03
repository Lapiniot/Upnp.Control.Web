using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models.Database.Upnp
{
    public class Service
    {
        [JsonPropertyName("_id")]
        [JsonIgnore]
        public int Id { get; set; }

        public Service(string serviceId, string metadataUrl, string serviceType, string controlUrl, string eventsUrl)
        {
            ServiceId = serviceId;
            MetadataUrl = metadataUrl;
            ServiceType = serviceType;
            ControlUrl = controlUrl;
            EventsUrl = eventsUrl;
        }

        [JsonPropertyName("id")]
        public string ServiceId { get; set; }

        [JsonPropertyName("url")]
        public string MetadataUrl { get; set; }

        [JsonPropertyName("type")]
        public string ServiceType { get; set; }

        [JsonIgnore]
        public string ControlUrl { get; set; }

        [JsonIgnore]
        public string EventsUrl { get; set; }
    }
}