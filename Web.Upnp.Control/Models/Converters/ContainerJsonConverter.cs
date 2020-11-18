using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

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
            writer.WriteString("id", value.Id);
            writer.WriteString("class", value.Class);
            writer.WriteString("title", value.Title);
            writer.WriteBoolean("container", true);

            if(value.AlbumArts is {Count: > 0} albumArts)
            {
                writer.WriteStartArray("albumArts");
                foreach(var art in albumArts) writer.WriteStringValue(art);
                writer.WriteEndArray();
            }

            if(value.Vendor is {Count: > 0} vendor)
            {
                writer.WriteStartObject("vendor");
                foreach(var (k, v) in vendor)
                {
                    if(!string.IsNullOrEmpty(v))
                    {
                        writer.WriteString(k, v);
                    }
                }

                writer.WriteEndObject();
            }

            if(value.Resource is {} res)
            {
                var resourceConverter = (JsonConverter<Resource>)options.GetConverter(typeof(Resource));
                writer.WritePropertyName("res");
                resourceConverter.Write(writer, res, options);
            }

            writer.WriteEndObject();
        }
    }
}