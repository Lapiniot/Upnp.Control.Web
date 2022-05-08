using System.Text.Json;
using System.Text.Json.Serialization;

namespace Upnp.Control.Infrastructure.PushNotifications;

public class JsonOptions
{
    public JsonSerializerOptions SerializerOptions { get; } = new JsonSerializerOptions()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
        IncludeFields = false,
        ReadCommentHandling = JsonCommentHandling.Skip
    };
}