using System.Text.Json.Serialization;

namespace Upnp.Control.Infrastructure.AspNetCore;

[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(ApplicationInfo))]
public sealed partial class JsonContext : JsonSerializerContext { }