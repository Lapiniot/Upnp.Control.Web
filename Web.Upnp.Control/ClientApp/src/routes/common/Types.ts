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
    resolution: string;
    bitrate: number;
    sampleFrequency: number;
    nrAudioChannels: number;
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