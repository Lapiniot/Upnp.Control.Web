using System.Text.Json;
using System.Text.Json.Serialization;

namespace Upnp.Control.Models.Converters;

public sealed class IconJsonConverter : JsonConverter<Icon>
{
    public override Icon Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => throw new NotImplementedException();

    public override void Write([NotNull] Utf8JsonWriter writer, Icon value, [NotNull] JsonSerializerOptions options)
    {
        if (value is null)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteStartObject();
        writer.WriteString("url", value.Url.AbsoluteUri);
        writer.WriteString("mime", value.Mime);
        writer.WriteNumber("w", value.Width);
        writer.WriteNumber("h", value.Height);
        writer.WriteEndObject();
    }
}