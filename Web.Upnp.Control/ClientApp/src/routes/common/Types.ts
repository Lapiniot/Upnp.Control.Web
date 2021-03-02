export type PropertyBag = {
    [key: string]: string
}

export type Icon = {
    w: number;
    h: number;
    url: string;
    mime?: string;
}

export type UpnpDevice = {
    udn: string;
    name: string;
    description: string;
    type: string;
    url: string;
    maker: string;
    makerUrl?: string;
    model: string;
    modelUrl?: string;
    modelNumber: string;
    presentUrl?: string;
    services: UpnpService[];
    icons: Icon[];
}

export type UpnpService = {
    usn: string;
    url: string;
    type: string;
}

export type DIDLResource = {
    proto: string;
    url: string;
    size?: number;
    duration?: string;
    resolution?: string;
    depth?: number;
    bitrate?: number;
    freq?: number;
    bits?: number;
    channels?: number;
    infoUri?: string;
    protection?: string;
}

export type DIDLItem = {
    id: string;
    class: string;
    title: string;
    readonly?: boolean;
    container?: boolean;
    count?: number;
    containerCount?: number;
    creator?: string;
    album?: string;
    albumArts?: string[];
    artists?: string[];
    actors?: string[];
    authors?: string[];
    producers?: string[];
    directors?: string[];
    publishers?: string[];
    date?: string;
    genre?: string;
    genres?: string[];
    track?: number;
    discographyUrl?: string;
    lyricsUrl?: string;
    description?: string;
    storageUsed?: number;
    storageTotal?: number;
    storageFree?: number;
    storageMedium?: number;
    res?: DIDLResource;
    vendor?: PropertyBag;
}

export type BrowseFetchResult = {
    total: number;
    self?: DIDLItem;
    items?: DIDLItem[];
    parents?: DIDLItem[];
}

export type PlaybackState = "STOPPED" | "PLAYING" | "TRANSITIONING" | "PAUSED_PLAYBACK" | "PAUSED_RECORDING" | "RECORDING" | "NO_MEDIA_PRESENT" | "CUSTOM"

export type PlaybackStatus = "OK" | "ERROR_OCCURRED" | "CUSTOM"

export type PlaybackMode = "NORMAL" | "SHUFFLE" | "REPEAT_SHUFFLE" | "REPEAT_TRACK" | "REPEAT_ONE" | "REPEAT_ALL" | "RANDOM"

export type AVState = {
    state: PlaybackState;
    actions: string[];
    current?: DIDLItem | null;
    next?: DIDLItem | null;
    status?: PlaybackStatus;
    tracks?: number | null;
    medium?: string | null;
    playMode?: PlaybackMode;
    currentTrack?: string | null;
    currentTrackUri?: string | null;
}

export type AVPositionState = {
    relTime: string;
    duration: string;
}

export type RCState = {
    volume: number;
    muted?: boolean;
}

export enum Services {
    MediaRenderer = "urn:schemas-upnp-org:device:MediaRenderer",
    ContentDirectory = "urn:schemas-upnp-org:service:ContentDirectory",
    UmiPlaylist = "urn:xiaomi-com:service:Playlist"
}

export type DataSourceProps<T = {}, P = {}> = P & {
    "data-source": T;
    "data-row-id"?: string | number
}

/* Routing related params extracted from navigation url */
export type CategoryRoutePath = "/:category";
export type DeviceRoutePath = "/:category/:device";
export type BrowseRoutePath = "/:category/:device/:action(browse)/:id?";
export type PlaylistRoutePath = "/:category/:device/:action(playlists)/:id?";
export type ViewRoutePath = "/:category/:device/:action(view)/:id";

export type CategoryRouteParams = { category: string }
export type DeviceRouteParams = CategoryRouteParams & { device: string }
export type BrowseRouteParams = DeviceRouteParams & { id?: string; p?: string; s?: string; };
export type PlaylistRouteParams = DeviceRouteParams & { id: string; p?: string; s?: string; };
export type ViewRouteParams = DeviceRouteParams & { id: string };