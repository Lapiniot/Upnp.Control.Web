namespace Upnp.Control.Models;

#pragma warning disable IDE0055

#region NotifyPropChanged commands

public abstract record NotifyPropChangedCommand(string DeviceId, Stream Content);

public sealed record RCPropChangedCommand(string DeviceId, Stream Content) : NotifyPropChangedCommand(DeviceId, Content);

public sealed record AVTPropChangedCommand(string DeviceId, Stream Content) : NotifyPropChangedCommand(DeviceId, Content);

#endregion

#region Device DB management commands

public record struct RemoveDeviceCommand(string DeviceId);

public record struct AddDeviceCommand(UpnpDevice Device);

public record struct UpdateDeviceExpirationCommand(string DeviceId, DateTime ExpiresAt);

#endregion

#region Playback control commands

public record struct AVSetStateCommand(string DeviceId, AVStateParams State);

public record struct AVSetPositionCommand(string DeviceId, AVPositionParams Position);

public record struct AVSetPlayModeCommand(string DeviceId, string PlayMode);

public record struct RCSetVolumeCommand(string DeviceId, uint Volume);

public record struct RCSetMuteCommand(string DeviceId, bool Muted);

public record struct AVStateParams(string State, string ObjectId, string SourceDevice, Uri CurrentUri);

public record struct AVPositionParams(double? Position, TimeSpan? RelTime);

#endregion

#region Playlist management commands

public record struct PLCreateCommand(string DeviceId, string Title);

public record struct PLCreateFromItemsCommand(string DeviceId, CreatePlaylistParams Params);

public record struct PLCreateFromFilesCommand(string DeviceId, IEnumerable<FileSource> Files, string Title, bool Merge, bool UseProxy);

public record struct PLRenameCommand(string DeviceId, string PlaylistId, string Title);

public record struct PLCopyCommand(string DeviceId, string PlaylistId, string Title);

public record struct PLRemoveCommand(string DeviceId, IEnumerable<string> PlaylistIds);

public record struct PLAddItemsCommand(string DeviceId, string PlaylistId, MediaSourceParams Source);

public record struct PLAddFeedUrlCommand(string DeviceId, string PlaylistId, FeedUrlSourceParams Source);

public record struct PLAddPlaylistFilesCommand(string DeviceId, string PlaylistId, IEnumerable<FileSource> Files, bool UseProxy);

public record struct PLRemoveItemsCommand(string DeviceId, string PlaylistId, IEnumerable<string> ItemIds);

public record struct CreatePlaylistParams(string Title, MediaSourceParams Source);

public record struct MediaSourceParams(string DeviceId, IEnumerable<string> Items, int? MaxDepth);

public record struct FeedUrlSourceParams(Uri Url, string Title, bool UseProxy);

public abstract class FileSource
{
    public abstract string FileName { get; }
    public abstract Stream GetStream();
}

#endregion

#region Queue management commands

public record struct QAddItemsCommand(string DeviceId, string QueueId, MediaSourceParams Source);

public record struct QClearCommand(string DeviceId, string QueueId);

#endregion