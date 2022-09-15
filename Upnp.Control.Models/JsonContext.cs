using System.Text.Json.Serialization;
using IoT.Protocol.Upnp.DIDL;

namespace Upnp.Control.Models;

[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(IAsyncEnumerable<UpnpDevice>))]
[JsonSerializable(typeof(UpnpDiscoveryMessage))]
[JsonSerializable(typeof(AVStateMessage))]
[JsonSerializable(typeof(RCStateMessage))]
[JsonSerializable(typeof(MediaSource))]
[JsonSerializable(typeof(CreatePlaylistParams))]
[JsonSerializable(typeof(FeedUrlSource))]
[JsonSerializable(typeof(AVStateParams))]
[JsonSerializable(typeof(AVPositionParams))]
[JsonSerializable(typeof(CDContent))]
[JsonSerializable(typeof(object))]
[JsonSerializable(typeof(MediaItem))]
[JsonSerializable(typeof(Container))]
[JsonSerializable(typeof(Resource))]
public partial class JsonContext : JsonSerializerContext
{
}