namespace Upnp.Control.Models;

#region NotifyPropChanged commands

public abstract record NotifyPropChangedCommand(string DeviceId, Stream Content);

public sealed record RCPropChangedCommand(string DeviceId, Stream Content) : NotifyPropChangedCommand(DeviceId, Content);

public sealed record AVTPropChangedCommand(string DeviceId, Stream Content) : NotifyPropChangedCommand(DeviceId, Content);

#endregion

public record struct RemoveDeviceCommand(string DeviceId);

public record struct AddDeviceCommand(UpnpDevice Device);

public record struct UpdateDeviceExpirationCommand(string DeviceId, DateTime ExpiresAt);

public record AVSetStateCommand(string DeviceId, AVStateParams State);

public record AVSetPositionCommand(string DeviceId, AVPositionParams Position);

public record AVSetPlayModeCommand(string DeviceId, string PlayMode);

public record RCSetVolumeCommand(string DeviceId, uint Volume);

public record RCSetMuteCommand(string DeviceId, bool Muted);

public record PLCreateCommand(string DeviceId, string Title);

public record PLCreateFromItemsCommand(string DeviceId, CreatePlaylistParams Params);

public record PLCreateFromFilesCommand(string DeviceId, IEnumerable<FileSource> Files, string Title, bool Merge, bool UseProxy);

public record PLRenameCommand(string DeviceId, string PlaylistId, string Title);

public record PLCopyCommand(string DeviceId, string PlaylistId, string Title);

public record PLRemoveCommand(string DeviceId, IEnumerable<string> PlaylistIds);

public record PLAddItemsCommand(string DeviceId, string PlaylistId, MediaSource Source);

public record PLAddFeedUrlCommand(string DeviceId, string PlaylistId, FeedUrlSource Source);

public record PLAddPlaylistFilesCommand(string DeviceId, string PlaylistId, IEnumerable<FileSource> Files, bool UseProxy);

public record PLRemoveItemsCommand(string DeviceId, string PlaylistId, IEnumerable<string> ItemIds);

public record QAddItemsCommand(string DeviceId, string QueueId, MediaSource Source);

public record QClearCommand(string DeviceId, string QueueId);