using System.Text.Json;
using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models.Converters
{
    public sealed class IconJsonConverter : JsonConverter<Icon>
    {
        public override Icon Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotImplementedException();
        }

        public override void Write(Utf8JsonWriter writer, Icon value, JsonSerializerOptions options)
        {
            if(writer is null) throw new ArgumentNullException(nameof(writer));
            if(options is null) throw new ArgumentNullException(nameof(options));

            if(value is null)
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
}