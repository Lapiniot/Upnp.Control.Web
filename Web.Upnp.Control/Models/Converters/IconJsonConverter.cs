using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models.Converters
{
    public class IconJsonConverter : JsonConverter<Icon>
    {
        public override Icon Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotImplementedException();
        }

        public override void Write(Utf8JsonWriter writer, Icon value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WriteString("url", value.Url.AbsoluteUri);
            writer.WriteString("mime", value.Mime);
            writer.WriteNumber("w", value.Width);
            writer.WriteNumber("h", value.Height);
            writer.WriteEndObject();
        }
    }
}