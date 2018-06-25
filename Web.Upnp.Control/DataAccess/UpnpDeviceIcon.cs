using Newtonsoft.Json;

namespace Web.Upnp.Control.DataAccess
{
    public class UpnpDeviceIcon
    {
        [JsonProperty("w")]
        public int Width { get; set; }

        [JsonProperty("h")]
        public int Height { get; set; }

        public string Url { get; set; }
    }
}