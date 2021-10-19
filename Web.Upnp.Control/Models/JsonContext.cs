using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models
{
    [JsonSerializable(typeof(UpnpDiscoveryMessage))]
    [JsonSerializable(typeof(AVStateMessage))]
    [JsonSerializable(typeof(RCStateMessage))]
    public partial class JsonContext : JsonSerializerContext
    {
    }
}