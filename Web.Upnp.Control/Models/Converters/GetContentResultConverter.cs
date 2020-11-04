using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models.Converters
{
    public class GetContentResultConverter : JsonConverter<GetContentResult>
    {
        public override GetContentResult Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotSupportedException();
        }

        public override void Write(Utf8JsonWriter writer, GetContentResult value, JsonSerializerOptions options)
        {
            if(writer == null) throw new ArgumentNullException(nameof(writer));

            writer.WriteStartObject();
            writer.WriteNumber("total", value.Total);

            var containerConverter = (JsonConverter<Container>)options.GetConverter(typeof(Container));
            var itemConverter = (JsonConverter<MediaItem>)options.GetConverter(typeof(MediaItem));

            writer.WriteStartArray("items");
            foreach(var item in value.Items)
            {
                switch(item)
                {
                    case Container c:
                        containerConverter.Write(writer, c, options);
                        break;
                    case MediaItem i:
                        itemConverter.Write(writer, i, options);
                        break;
                    default: throw new NotSupportedException("Not supported DIDL item type");
                }
            }
            writer.WriteEndArray();

            if(value.Parents is { } parents)
            {
                writer.WriteStartArray("parents");
                foreach(Container parent in parents)
                {
                    containerConverter.Write(writer, parent, options);
                }
                writer.WriteEndArray();
            }

            writer.WriteEndObject();
            writer.Flush();
        }
    }
}