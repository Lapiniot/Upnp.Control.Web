using System.Text.Json.Serialization;
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