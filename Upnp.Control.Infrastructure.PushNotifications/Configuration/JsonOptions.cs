using System.Text.Json;
using System.Text.Json.Serialization;

namespace Upnp.Control.Infrastructure.PushNotifications.Configuration;

public class JsonOptions
{
    public JsonOptions()
    {
        SerializerOptions = new JsonSerializerOptions()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
            IncludeFields = false,
            ReadCommentHandling = JsonCommentHandling.Skip,
        };
    }

    public JsonSerializerOptions SerializerOptions { get; }
}