using System.Text.Json;
using System.Text.Json.Serialization;
using Upnp.Control.Infrastructure.AspNetCore.Api.Converters;

namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static class JsonSerializerOptionsExtensions
{
    private static readonly JsonConverter[] CustomConverters = [
        new IconJsonConverter(),
        new ServiceJsonConverter(),
        new DeviceJsonConverter(),
        new ResourceJsonConverter(),
        new ItemJsonConverter(),
        new ContainerJsonConverter(),
        new MediaItemJsonConverter()
    ];

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

        options.TypeInfoResolverChain.Add(JsonContext.Default);
    }
}