using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Upnp.Control.Models.Converters;

public sealed class CDContentConverter : JsonConverter<CDContent>
{
    public override CDContent Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => throw new NotSupportedException();

    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode")]
    public override void Write([NotNull] Utf8JsonWriter writer, CDContent value, [NotNull] JsonSerializerOptions options)
    {
        if (value is null)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteStartObject();
        writer.WriteNumber("total", value.Total);

        var containerConverter = (JsonConverter<Container>)options.GetConverter(typeof(Container));
        var itemConverter = (JsonConverter<MediaItem>)options.GetConverter(typeof(MediaItem));

        if (value.Metadata is not null)
        {
            writer.WritePropertyName("self");
            WriteItem(value.Metadata);
        }

        if (value.Device is not null)
        {
            writer.WriteStartObject("dev");
            writer.WriteString("name", value.Device.Name);
            writer.WriteString("desc", value.Device.Description);
            writer.WriteEndObject();
        }

        if (value.Items is { } items)
        {
            writer.WriteStartArray("items");
            foreach (var item in items)
            {
                WriteItem(item);
            }

            writer.WriteEndArray();
        }

        if (value.Parents is { } parents)
        {
            writer.WriteStartArray("parents");
            foreach (var item in parents)
            {
                if (item is Container container)
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
            switch (item)
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