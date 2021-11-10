using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Upnp.Control.Models.Converters;

public sealed class ItemJsonConverter : JsonConverter<Item>
{
    public override Item Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotSupportedException();
    }

    public override void Write([NotNull] Utf8JsonWriter writer, Item value, [NotNull] JsonSerializerOptions options)
    {
        if(value is null)
        {
            writer.WriteNullValue();
            return;
        }

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