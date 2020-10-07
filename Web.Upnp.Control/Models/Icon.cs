using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models
{
    public class Icon
    {
        public Icon(int width, int height, string url, string mime)
        {
            Width = width;
            Height = height;
            Url = url;
            Mime = mime;
        }

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