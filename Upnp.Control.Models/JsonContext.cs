using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;
using IoT.Protocol.Upnp.DIDL;

namespace Upnp.Control.Models;

[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(UpnpDiscoveryMessage))]
[JsonSerializable(typeof(AVStateMessage))]
[JsonSerializable(typeof(RCStateMessage))]
[JsonSerializable(typeof(MediaSourceParams))]
[JsonSerializable(typeof(CreatePlaylistParams))]
[JsonSerializable(typeof(FeedUrlSourceParams))]
[JsonSerializable(typeof(AVStateParams))]
[JsonSerializable(typeof(AVPositionParams))]
[JsonSerializable(typeof(CDContent))]
[JsonSerializable(typeof(MediaItem))]
[JsonSerializable(typeof(Container))]
[JsonSerializable(typeof(Resource))]
[JsonSerializable(typeof(object))]
[JsonSerializable(typeof(IAsyncEnumerable<UpnpDevice>))]
public partial class JsonContext : JsonSerializerContext
{ }

public sealed class PolymorphicJsonSerializerContext : JsonContext
{
    public override JsonTypeInfo GetTypeInfo(Type type)
    {
        var typeInfo = base.GetTypeInfo(type);

        if (typeInfo.Type == typeof(Item))
        {
            typeInfo.PolymorphismOptions = new JsonPolymorphismOptions()
            {
                DerivedTypes = { new(typeof(Container)), new(typeof(MediaItem)) }
            };
        }

        return typeInfo;
    }
}