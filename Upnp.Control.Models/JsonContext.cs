using System.Text.Json.Serialization;

namespace Upnp.Control.Models;

[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(UpnpDiscoveryMessage))]
[JsonSerializable(typeof(AVStateMessage))]
[JsonSerializable(typeof(RCStateMessage))]
[JsonSerializable(typeof(MediaSource))]
[JsonSerializable(typeof(CreatePlaylistParams))]
[JsonSerializable(typeof(FeedUrlSource))]
[JsonSerializable(typeof(AVStateParams))]
[JsonSerializable(typeof(AVPositionParams))]
[JsonSerializable(typeof(IAsyncEnumerable<UpnpDevice>))]
[JsonSerializable(typeof(CDContent))]
public partial class JsonContext : JsonSerializerContext
{
}