using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models.Converters
{
    public class ItemJsonConverter : JsonConverter<Item>
    {
        public override Item Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotSupportedException();
        }

        public override void Write(Utf8JsonWriter writer, Item value, JsonSerializerOptions options)
        {
            if(options is null) throw new ArgumentNullException(nameof(options));

            switch(value)
            {
                case Container container:
                    ((JsonConverter<Container>)options.GetConverter(typeof(Container))).Write(writer, container, options);
                    break;
                case MediaItem mediaItem:
                    ((JsonConverter<MediaItem>)options.GetConverter(typeof(MediaItem))).Write(writer, mediaItem, options);
                    break;
                default:
                    throw new NotSupportedException("Unsupported type");
            }
        }
    }
}