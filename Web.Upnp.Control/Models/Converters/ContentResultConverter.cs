using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models.Converters
{
    public class ContentResultConverter : JsonConverter<ContentResult>
    {
        public override ContentResult Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotSupportedException();
        }

        public override void Write(Utf8JsonWriter writer, ContentResult value, JsonSerializerOptions options)
        {
            if(writer == null) throw new ArgumentNullException(nameof(writer));

            writer.WriteStartObject();
            writer.WriteNumber("total", value.Total);

            var containerConverter = (JsonConverter<Container>)options.GetConverter(typeof(Container));
            var itemConverter = (JsonConverter<MediaItem>)options.GetConverter(typeof(MediaItem));

            if(value.metadata is not null)
            {
                writer.WritePropertyName("self");
                WriteItem(value.metadata);
            }

            if(value.Items is { } items)
            {
                writer.WriteStartArray("items");
                foreach(var item in items)
                {
                    WriteItem(item);
                }
                writer.WriteEndArray();
            }

            if(value.Parents is { } parents)
            {
                writer.WriteStartArray("parents");
                foreach(var item in parents)
                {
                    if(item is Container container)
                    {
                        containerConverter.Write(writer, container, options);
                    }
                }
                writer.WriteEndArray();
            }

            writer.WriteEndObject();
            writer.Flush();

            void WriteItem(Item item)
            {
                switch(item)
                {
                    case Container container:
                        containerConverter.Write(writer, container, options);
                        break;
                    case MediaItem mediaItem:
                        itemConverter.Write(writer, mediaItem, options);
                        break;
                    default: throw new NotSupportedException("Not supported DIDL item type");
                }
            }
        }
    }
}