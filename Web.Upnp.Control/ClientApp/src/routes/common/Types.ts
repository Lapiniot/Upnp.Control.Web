export type Icon = {
    w: number;
    h: number;
    url: string;
    mime?: string;
};

export enum Services {
    MediaRenderer = "urn:schemas-upnp-org:device:MediaRenderer",
    ContentDirectory = "urn:schemas-upnp-org:service:ContentDirectory",
    UmiPlaylist = "urn:xiaomi-com:service:Playlist"
}