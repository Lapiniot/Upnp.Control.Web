using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;
using static Web.Upnp.Control.Models.Converters.DIDLWriterUtils;

namespace Web.Upnp.Control.Models.Converters
{
    public class ContainerJsonConverter : JsonConverter<Container>
    {
        public override Container Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotSupportedException();
        }

        public override void Write(Utf8JsonWriter writer, Container value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            WriteCoreProps(writer, value);
            WriteCollection(writer, "albumArts", value.AlbumArts);
            WriteResource(writer, value, options);
            WriteVendorProps(writer, value);
            writer.WriteEndObject();
        }
    }
}