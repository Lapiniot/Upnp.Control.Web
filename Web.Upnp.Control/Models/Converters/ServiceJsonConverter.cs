using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models.Converters
{
    public class ServiceJsonConverter : JsonConverter<Service>
    {
        public override Service Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotImplementedException();
        }

        public override void Write(Utf8JsonWriter writer, Service value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WriteString("usn", value.UniqueServiceName);
            writer.WriteString("type", value.ServiceType);
            writer.WriteString("url", value.MetadataUrl.AbsoluteUri);
            writer.WriteEndObject();
        }
    }
}