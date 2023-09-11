using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;

namespace Upnp.Control.Infrastructure.PushNotifications;

public class JsonOptions
{
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "<Pending>")]
    public JsonSerializerOptions SerializerOptions { get; } = new(JsonSerializerDefaults.Web)
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        TypeInfoResolver = JsonSerializer.IsReflectionEnabledByDefault ? new DefaultJsonTypeInfoResolver() : JsonTypeInfoResolver.Combine()
    };
}