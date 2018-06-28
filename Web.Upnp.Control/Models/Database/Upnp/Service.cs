using Newtonsoft.Json;

namespace Web.Upnp.Control.Models.Database.Upnp
{
    public class Service
    {
        [JsonIgnore]
        public int Id { get; set; }

        [JsonProperty("id")]
        public string ServiceId { get; set; }

        [JsonProperty("url")]
        public string MetadataUrl { get; set; }

        [JsonProperty("type")]
        public string ServiceType { get; set; }

        [JsonIgnore]
        public string ControlUrl { get; set; }
    }
}