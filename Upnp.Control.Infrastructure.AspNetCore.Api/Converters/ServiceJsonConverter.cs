using System.Text.Json;
using System.Text.Json.Serialization;

namespace Upnp.Control.Infrastructure.AspNetCore.Api.Converters;

public sealed class ServiceJsonConverter : JsonConverter<Service>
{
    public override Service Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => throw new NotSupportedException();

    public override void Write([NotNull] Utf8JsonWriter writer, Service value, [NotNull] JsonSerializerOptions options)
    {
        if (value is null)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteStartObject();
        writer.WriteString("usn", value.UniqueServiceName);
        writer.WriteString("type", value.ServiceType);
        writer.WriteString("url", value.MetadataUrl.AbsoluteUri);
        writer.WriteEndObject();
    }
}