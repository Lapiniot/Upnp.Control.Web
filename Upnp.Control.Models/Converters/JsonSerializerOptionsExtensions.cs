using System.Text.Json;
using System.Text.Json.Serialization;

namespace Upnp.Control.Models.Converters;

public static class JsonSerializerOptionsExtensions
{
    private static readonly JsonConverter[] CustomConverters = {
        new IconJsonConverter(), new ServiceJsonConverter(), new DeviceJsonConverter(),
        new ResourceJsonConverter(), new ContainerJsonConverter(), new MediaItemJsonConverter()
    };

    public static void ConfigureDefaults(this JsonSerializerOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
        options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.IgnoreReadOnlyProperties = true;
        options.IgnoreReadOnlyFields = true;

        foreach (var converter in CustomConverters)
        {
            options.Converters.Add(converter);
        }

        options.AddContext<PolymorphicJsonSerializerContext>();
    }
}