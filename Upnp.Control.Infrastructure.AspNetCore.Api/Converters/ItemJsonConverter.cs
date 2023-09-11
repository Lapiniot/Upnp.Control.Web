using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Upnp.Control.Infrastructure.AspNetCore.Api.Converters;

public sealed class ItemJsonConverter : JsonConverter<Item>
{
    public override Item Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => throw new NotSupportedException();

    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public override void Write(Utf8JsonWriter writer, Item value, [NotNull] JsonSerializerOptions options)
    {
        if (value is Container container)
        {
            ((JsonConverter<Container>)options.GetConverter(typeof(Container))).Write(writer, container, options);
        }
        else if (value is MediaItem mediaItem)
        {
            ((JsonConverter<MediaItem>)options.GetConverter(typeof(MediaItem))).Write(writer, mediaItem, options);
        }
        else
        {
            throw new NotSupportedException("Unsupported derived type");
        }
    }
}