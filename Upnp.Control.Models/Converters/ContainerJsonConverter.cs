using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

using static Upnp.Control.Models.Converters.DIDLWriterUtils;

namespace Upnp.Control.Models.Converters;

public sealed class ContainerJsonConverter : JsonConverter<Container>
{
    public override Container Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => throw new NotSupportedException();

    public override void Write([NotNull] Utf8JsonWriter writer, Container value, [NotNull] JsonSerializerOptions options)
    {
        if (value is null)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteStartObject();
        WriteCoreProps(writer, value);
        if (value.ChildCount is { } childCount) writer.WriteNumber("count", childCount);
        if (value.ChildContainerCount is { } childContainerCount) writer.WriteNumber("containerCount", childContainerCount);
        WriteCollection(writer, "albumArts", value.AlbumArts);
        WriteResource(writer, value, options);
        WriteVendorProps(writer, value);
        writer.WriteEndObject();
    }
}