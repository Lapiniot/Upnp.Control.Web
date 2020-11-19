export type Icon = {
    w: number;
    h: number;
    url: string;
    mime?: string;
};

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
};

export type UpnpService = {
    usn: string;
    url: string;
    type: string;
};

export type DIDLResource = {
    proto: string;
    url: string;
    size?: number;
    duration?: string;
    resolution?: string;
    bitrate?: number;
    sampleFrequency?: number;
    nrAudioChannels?: number;
};

export type DIDLItem = {
    id: string;
    class: string;
    title: string;
    container?: boolean;
    creator?: string;
    album?: string;
    albumArts?: string[];
    res?: DIDLResource;
}

export type BrowseFetchResult = {
    total: number;
    items: DIDLItem[];
    parents?: DIDLItem[];
};

export enum Services {
    MediaRenderer = "urn:schemas-upnp-org:device:MediaRenderer",
    ContentDirectory = "urn:schemas-upnp-org:service:ContentDirectory",
    UmiPlaylist = "urn:xiaomi-com:service:Playlist"
};

export type DataSourceProps<T = {}, P = {}> = P & {
    "data-source": T;
    "data-row-id"?: string | number
};