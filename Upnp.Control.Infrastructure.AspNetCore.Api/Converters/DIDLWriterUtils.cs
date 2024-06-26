using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Upnp.Control.Infrastructure.AspNetCore.Api.Converters;

internal static class DIDLWriterUtils
{
    public static void WriteCoreProps(Utf8JsonWriter writer, Item item)
    {
        writer.WriteString("id", item.Id);
        writer.WriteString("class", item.Class);
        writer.WriteString("title", item.Title);

        if (item.StorageUsed is { } storageUsed and > 0) writer.WriteNumber(nameof(storageUsed), storageUsed);
        if (item.StorageTotal is { } storageTotal) writer.WriteNumber(nameof(storageTotal), storageTotal);
        if (item.StorageFree is { } storageFree) writer.WriteNumber(nameof(storageFree), storageFree);
        if (item.StorageMedium is { } storageMedium) writer.WriteNumber(nameof(storageMedium), storageMedium);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void WriteCollection(Utf8JsonWriter writer, string name, ICollection<string> values)
    {
        if (!(values?.Count > 0)) return;
        writer.WriteStartArray(name);
        foreach (var value in values) writer.WriteStringValue(value);
        writer.WriteEndArray();
    }

    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static void WriteResource(Utf8JsonWriter writer, Item item, JsonSerializerOptions options)
    {
        if (item.Resource is not { } res) return;
        var resourceConverter = (JsonConverter<Resource>)options.GetConverter(typeof(Resource));
        writer.WritePropertyName("res");
        resourceConverter.Write(writer, res, options);
    }

    public static void WriteVendorProps(Utf8JsonWriter writer, Item item)
    {
        if (item.Vendor is not { Count: > 0 } vendor) return;
        writer.WriteStartObject("vendor");
        foreach (var (key, value) in vendor)
        {
            if (!string.IsNullOrEmpty(value)) writer.WriteString(key, value);
        }

        writer.WriteEndObject();
    }
}