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

export type UpnpDeviceCategory = "umi" | "renderers" | "upnp";

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
    vendor?: Record<string, string>;
}

export type BrowseFetchResult = {
    total: number;
    dev?: { name: string; desc: string };
    self?: DIDLItem;
    items?: DIDLItem[];
    parents?: DIDLItem[];
}

export type DeviceDescription = {
    udn: string;
    name: string;
    description: string;
}

export type PlaybackState = "STOPPED" | "PLAYING" | "TRANSITIONING" | "PAUSED_PLAYBACK" | "PAUSED_RECORDING" | "RECORDING" | "NO_MEDIA_PRESENT" | "CUSTOM" | "UNKNOWN"

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

export type AVPosition = {
    currentTrack: string | undefined | null;
    current: DIDLItem | undefined | null;
    relTime: string;
    duration: string;
}

export type RCState = {
    volume: number;
    muted?: boolean;
}

export type CategoryRouteParams = { category: UpnpDeviceCategory }
export type DeviceRouteParams = CategoryRouteParams & { device: string }
export type BrowseRouteParams = DeviceRouteParams & { id?: string; p?: string; s?: string; };
export type PlaylistRouteParams = DeviceRouteParams & { id: string; p?: string; s?: string; };
export type ViewRouteParams = DeviceRouteParams & { id: string };

export type ThemeColors = "primary" | "secondary" | "success" | "info" | "warning" | "danger" | "light" | "dark"