using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Web.Upnp.Control.Models.Converters
{
    internal static class DIDLWriterUtils
    {
        public static void WriteCoreProps(Utf8JsonWriter writer, Item item)
        {
            writer.WriteString("id", item.Id);
            writer.WriteString("class", item.Class);
            writer.WriteString("title", item.Title);
            writer.WriteBoolean("container", item is Container);

            if(item.StorageUsed is { } storageUsed) writer.WriteNumber(nameof(storageUsed), storageUsed);
            if(item.StorageTotal is { } storageTotal) writer.WriteNumber(nameof(storageTotal), storageTotal);
            if(item.StorageFree is { } storageFree) writer.WriteNumber(nameof(storageFree), storageFree);
            if(item.StorageMedium is { } storageMedium) writer.WriteNumber(nameof(storageMedium), storageMedium);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void WriteCollection(Utf8JsonWriter writer, string name, ICollection<string> values)
        {
            if(values?.Count > 0)
            {
                writer.WriteStartArray(name);
                foreach(var value in values) writer.WriteStringValue(value);
                writer.WriteEndArray();
            }
        }

        public static void WriteResource(Utf8JsonWriter writer, Item item, JsonSerializerOptions options)
        {
            if(item.Resource is { } res)
            {
                var resourceConverter = (JsonConverter<Resource>)options.GetConverter(typeof(Resource));
                writer.WritePropertyName("res");
                resourceConverter.Write(writer, res, options);
            }
        }

        public static void WriteVendorProps(Utf8JsonWriter writer, Item item)
        {
            if(item.Vendor is { Count: > 0 } vendor)
            {
                writer.WriteStartObject("vendor");
                foreach(var (key, value) in vendor)
                {
                    if(!string.IsNullOrEmpty(value)) writer.WriteString(key, value);
                }
                writer.WriteEndObject();
            }
        }
    }
}