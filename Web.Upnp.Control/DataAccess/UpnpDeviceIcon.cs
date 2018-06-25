using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Web.Upnp.Control.DataAccess
{
    public class UpnpDeviceIcon
    {
        [JsonIgnore]
        public int Id { get; set; }

        [JsonProperty("w")]
        public int Width { get; set; }

        [JsonProperty("h")]
        public int Height { get; set; }

        public string Url { get; set; }
        public string Mime { get; set; }
    }
}