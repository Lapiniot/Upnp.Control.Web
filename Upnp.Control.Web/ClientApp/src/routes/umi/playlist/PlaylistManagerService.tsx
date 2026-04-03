export interface PlaylistManagerService {
    create(): void;
    deletePlaylists(playlists: Upnp.DIDL.Item[]): void;
    renamePlaylist(playlist: Upnp.DIDL.Item): void;
    copyPlaylist(playlist: Upnp.DIDL.Item): void;
    addItems(): void,
    addFeedUrl(): void,
    addPlaylistFiles(): void,
    deleteItems(items: Upnp.DIDL.Item[]): void,
    toggleEditMode(): void
    navigateBack(): void
}