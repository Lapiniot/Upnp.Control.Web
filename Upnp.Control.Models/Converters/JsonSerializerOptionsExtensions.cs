using System.Text.Json;
using System.Text.Json.Serialization;

namespace Upnp.Control.Models.Converters;

public static class JsonSerializerOptionsExtensions
{
    private static readonly JsonConverter[] customConverters = new JsonConverter[]
    {
        new IconJsonConverter(), new ServiceJsonConverter(),
        new DeviceJsonConverter(), new ItemJsonConverter(),
        new ResourceJsonConverter(), new ContainerJsonConverter(),
        new MediaItemJsonConverter(), new CDContentConverter()
    };

    public static void ConfigureDefaults(this JsonSerializerOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
        options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.IgnoreReadOnlyProperties = true;
        options.IgnoreReadOnlyFields = true;

        foreach (var converter in customConverters)
        {
            options.Converters.Add(converter);
        }

        options.AddContext<JsonContext>();
    }
}