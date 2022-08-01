import DIDLItem = Upnp.DIDL.Item

export interface PlaylistManagerService {
    create(): void;
    deletePlaylists(playlists: DIDLItem[]): void;
    renamePlaylist(playlist: DIDLItem): void;
    copyPlaylist(playlist: DIDLItem): void;
    addItems(): void,
    addFeedUrl(): void,
    addPlaylistFiles(): void,
    deleteItems(items: DIDLItem[]): void,
    toggleEditMode(): void
    navigateBack(): void
}