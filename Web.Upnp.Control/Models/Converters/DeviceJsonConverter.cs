using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Web.Upnp.Control.Models.Converters
{
    public class DeviceJsonConverter : JsonConverter<Device>
    {
        public override Device Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotImplementedException();
        }

        public override void Write(Utf8JsonWriter writer, Device value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WriteString("udn", value.Udn);
            writer.WriteString("url", value.Location.AbsoluteUri);
            writer.WriteString("type", value.DeviceType);
            writer.WriteString("name", value.FriendlyName);
            writer.WriteString("maker", value.Manufacturer);
            writer.WriteString("description", value.Description);
            writer.WriteString("model", value.ModelName);
            writer.WriteString("modelNumber", value.ModelNumber);

            var serviceConverter = (JsonConverter<Service>)options.GetConverter(typeof(Service));

            writer.WriteStartArray("services");
            foreach(var service in value.Services)
            {
                serviceConverter.Write(writer, service, options);
            }
            writer.WriteEndArray();

            var iconConverter = (JsonConverter<Icon>)options.GetConverter(typeof(Icon));

            writer.WriteStartArray("icons");
            foreach(var icon in value.Icons)
            {
                iconConverter.Write(writer, icon, options);
            }
            writer.WriteEndArray();

            writer.WriteEndObject();
        }
    }
}