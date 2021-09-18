namespace Web.Upnp.Control.Models
{
    public record AVSetStateCommand(string DeviceId, AVStateParams State);
    public record AVSetPositionCommand(string DeviceId, AVPositionParams Position);
    public record AVSetPlayModeCommand(string DeviceId, string PlayMode);
    public record RCSetVolumeCommand(string DeviceId, uint Volume);
    public record RCSetMuteCommand(string DeviceId, bool Muted);
    public record PLCreateCommand(string DeviceId, string Title);
    public record PLCreateFromItemsCommand(string DeviceId, CreatePlaylistParams Params);
    public record PLCreateFromFilesCommand(string DeviceId, PlaylistFilesSource Source, string Title, bool? Merge);
    public record PLRenameCommand(string DeviceId, string PlaylistId, string Title);
    public record PLCopyCommand(string DeviceId, string PlaylistId, string Title);
    public record PLRemoveCommand(string DeviceId, IEnumerable<string> PlaylistIds);
    public record PLAddItemsCommand(string DeviceId, string PlaylistId, MediaSource Source);
    public record PLAddFeedUrlCommand(string DeviceId, string PlaylistId, FeedUrlSource Source);
    public record PLAddPlaylistFilesCommand(string DeviceId, string PlaylistId, PlaylistFilesSource Source);
    public record PLRemoveItemsCommand(string DeviceId, string PlaylistId, IEnumerable<string> ItemIds);
    public record QAddItemsCommand(string DeviceId, string QueueId, MediaSource Source);
    public record QClearCommand(string DeviceId, string QueueId);
    public record PSAddCommand(PushSubscription Subscription);
    public record PSRemoveCommand(PushSubscription Subscription);
}