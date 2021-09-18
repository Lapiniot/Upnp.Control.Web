using System.Text.Json;
using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models.Converters;

public sealed class ServiceJsonConverter : JsonConverter<Service>
{
    public override Service Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotSupportedException();
    }

    public override void Write(Utf8JsonWriter writer, Service value, JsonSerializerOptions options)
    {
        if(writer is null) throw new ArgumentNullException(nameof(writer));
        if(options is null) throw new ArgumentNullException(nameof(options));

        if(value is null)
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