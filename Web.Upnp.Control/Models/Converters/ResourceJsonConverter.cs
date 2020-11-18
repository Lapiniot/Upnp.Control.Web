using System;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models.Converters
{
    public class ResourceJsonConverter : JsonConverter<Resource>
    {
        public override Resource Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotSupportedException();
        }

        public override void Write(Utf8JsonWriter writer, Resource value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();

            writer.WriteString("url", value.Url);
            writer.WriteString("proto", value.Protocol);
            if(value.Size is {} size) writer.WriteNumber("size", size);
            if(value.Duration is {} duration)
            {
                writer.WriteString("duration", duration.ToString(
                    duration.Days == 0 ? duration.Hours == 0 ? @"mm\:ss" : @"hh\:mm\:ss" : @"d\.hh\:mm\:ss",
                    CultureInfo.InvariantCulture));
            }

            if(value.Attributes is {Count: > 0})
            {
                foreach(var (k, v) in value.Attributes) writer.WriteString(k, v);
            }

            writer.WriteEndObject();
        }
    }
}