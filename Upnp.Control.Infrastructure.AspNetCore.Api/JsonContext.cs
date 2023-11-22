using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;
using Upnp.Control.Infrastructure.AspNetCore.Api.Converters;

namespace Upnp.Control.Infrastructure.AspNetCore.Api;

#pragma warning disable IDE0300

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DictionaryKeyPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    IgnoreReadOnlyProperties = true,
    IgnoreReadOnlyFields = true,
    Converters = new Type[]{
        typeof(IconJsonConverter), typeof(ServiceJsonConverter), typeof(DeviceJsonConverter),
        typeof(ResourceJsonConverter), typeof(ItemJsonConverter), typeof(ContainerJsonConverter),
        typeof(MediaItemJsonConverter)
    })]
[JsonSerializable(typeof(string[]))]
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
[JsonSerializable(typeof(IAsyncEnumerable<UpnpDevice>))]
[JsonSerializable(typeof(PushSubscriptionRequest))]
[JsonSerializable(typeof(PushSubscriptionState))]
public partial class JsonContext : JsonSerializerContext { }