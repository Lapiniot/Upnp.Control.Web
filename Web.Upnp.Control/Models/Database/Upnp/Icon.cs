using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models.Database.Upnp
{
    public class Icon
    {
        [JsonIgnore]
        public int Id { get; set; }

        [JsonPropertyName("w")]
        public int Width { get; set; }

        [JsonPropertyName("h")]
        public int Height { get; set; }

        public string Url { get; set; }

        public string Mime { get; set; }
    }
}