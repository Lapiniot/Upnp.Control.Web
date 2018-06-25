using System;
using Newtonsoft.Json;

namespace Web.Upnp.Control.DataAccess
{
    public class UpnpService
    {
        [JsonIgnore]
        public int Id { get; set; }

        [JsonProperty("id")]
        public string ServiceId { get; set; }

        public string Url { get; set; }
    }
}