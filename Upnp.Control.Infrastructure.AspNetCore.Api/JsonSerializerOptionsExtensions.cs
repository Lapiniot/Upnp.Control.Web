using System.Text.Json;
using System.Text.Json.Serialization;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

public static class JsonSerializerOptionsExtensions
{
    extension(JsonSerializerOptions options)
    {
        public void ConfigureApiDefaults()
        {
            ArgumentNullException.ThrowIfNull(options);

            options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
            options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.IgnoreReadOnlyProperties = true;
            options.IgnoreReadOnlyFields = true;

            options.TypeInfoResolver = JsonContext.Default;

            foreach (var converter in JsonContext.Default.Options.Converters)
            {
                options.Converters.Add(converter);
            }
        }
    }
}